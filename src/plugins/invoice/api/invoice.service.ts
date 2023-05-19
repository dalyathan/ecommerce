import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import {
  AdministratorService,
  Channel,
  ChannelService,
  ProcessContext,
  EventBus,
  FulfillmentEvent,
  Injector,
  JobQueue,
  JobQueueService,
  Logger,
  Order,
  OrderService,
  RequestContext,
  TransactionalConnection,
  ID,
  Fulfillment,
  ConfigService,
  Administrator,
} from '@etech/core';

import {
  Invoice,
  InvoiceConfigInput,
  InvoiceList,
  InvoicesListInput,
  MyInvoicesInput,
} from '../../../ui/generated/graphql';
// @ts-ignore
import * as pdf from 'pdf-creator-node';
import Handlebars from 'handlebars';
import { defaultTemplate } from './default-template';
import { InvoicePluginConfig } from '../invoice.plugin';
import { loggerCtx, PLUGIN_INIT_OPTIONS } from '../constants';
import { InvoiceConfigEntity } from './entities/invoice-config.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceData } from './strategies/data-strategy';
import { createReadStream, ReadStream, createWriteStream } from 'fs';
import {
  LocalStorageStrategy,
  RemoteStorageStrategy,
} from './strategies/storage-strategy';
import { Response } from 'express';
import { createTempFile } from './file.util';
import { SortOrder } from '@etech/core';
import { ModuleRef } from '@nestjs/core';
import{getRepository} from 'typeorm';
import { getCurrentUser } from '../../addons/api/get-current-user';
import { ReflectSurchargesOnOrderService } from '../../addons/api/services/order-line-price-modification.service';
interface DownloadInput {
  channelToken: string;
  customerEmail: string;
  orderCode: string;
  res: Response;
}

@Injectable()
export class InvoiceService /*implements OnModuleInit ,OnApplicationBootstrap*/ {
  jobQueue: JobQueue<{ channelToken: string; orderCode: string;adminUserId: ID}> | undefined;
  retries = 1;

  constructor(
    private eventBus: EventBus,
    private jobService: JobQueueService,
    private orderService: OrderService,
    private priceReflectionService: ReflectSurchargesOnOrderService, 
    private channelService: ChannelService,
    private moduleRef: ModuleRef,
    private processContext: ProcessContext,
    private connection: TransactionalConnection,
    private configService: ConfigService,
    @Inject(PLUGIN_INIT_OPTIONS) private config: InvoicePluginConfig
  ) {
    Handlebars.registerHelper('formatMoney', (amount?: number) => {
      if (amount == null) {
        return amount;
      }
      return (amount / 100).toFixed(2);
    });
  }

  async onModuleInit(): Promise<void> {
    // Init jobQueue
    this.jobQueue = await this.jobService.createQueue({
      name: 'generate-invoice',
      process: async (job) =>
        this.createAndSaveInvoice(
          job.data.channelToken,
          job.data.orderCode,
          job.data.adminUserId
        ).catch(async (error) => {
          if (job.attempts >= this.retries) {
            Logger.error(
              `Failed to generate invoice for ${job.data.orderCode}. This was the final attempt.`,
              loggerCtx,
              error
            );
          }
          Logger.warn(
            `Failed to generate invoice for ${job.data.orderCode}: ${error?.message}`,
            loggerCtx
          );
          throw error;
        }),
    });
  }

  /**
   * Listen for FulfillmentEvent. When an event occures, place generate-invoice job in queue
   */
  onApplicationBootstrap(): void {
    if(this.processContext.isServer){
      this.eventBus.ofType(FulfillmentEvent).subscribe(async ({ ctx, entity,  }) => {
        if(entity.state === 'Created'){
          const orderRepo= this.connection.getRepository(ctx, Order);
          console.log('before order code,id',entity.orderItems[0].lineId)
          // let order= await this.orderService.findOneByOrderLineId(ctx, entity.orderItems[0].lineId);
          const order= await orderRepo.createQueryBuilder('order')
          .innerJoin('order.lines', 'line', 'line.id = :orderLineId', {orderLineId: entity.orderItems[0].lineId })
          .getOne();
          console.log('after order code,id')
          const fulfillmentRepo= getRepository(Fulfillment);
          if(! await fulfillmentRepo.count({where:{id:entity.id}})){
              return;
          }
          if (!this.jobQueue) {
            return Logger.error(`Invoice jobQueue not initialized`, loggerCtx);
          }
          const enabled = await this.isInvoicePluginEnabled(ctx,
            ctx.channelId as string
          );
          if (!enabled) {
            return Logger.debug(
              `Invoice generation not enabled for order ${order.code}`,
              loggerCtx
            );
          }
          await this.jobQueue.add(
            {
              channelToken: ctx.channel.token,
              orderCode: order.code,
              adminUserId: ctx.activeUserId
            },
            { retries: this.retries }
          );
          return Logger.info(
            `Added invoice job to queue for order ${order.code}`,
            loggerCtx
          );
        }
      });
    }
  }

  /**
   * Creates an invoice and save it to DB
   * Checks if an invoice has already been created for this order
   */
  async createAndSaveInvoice(channelToken: string, orderId: ID, adminUserId: ID) {
    const ctx = await this.createCtx(channelToken);
    let [order, existingInvoice, config] = await Promise.all([
      this.orderService.findOne(ctx, orderId),
      this.getInvoice(ctx,orderId as string),
      this.getConfig(ctx, ctx.channelId as string),
    ]);
    if (!config) {
      throw Error(
        `Cannot generate invoice for ${orderId}, because no config was found`
      );
    } else if (!config.enabled) {
      return Logger.warn(
        `Not generating invoice for ${order.code}, because plugin is disabled. This message should not be in the queue!`,
        loggerCtx
      );
    } else if (!order) {
      throw Error(`No order found with code ${order.code}`);
    }
    if(order.state === 'AddingItems' || order.state === 'Cancelled' 
      || order.state === 'ArrangingAdditionalPayment' || order.state === 'ArrangingPayment'){
        throw Error(`invoice can't be generated for order ${order.code} at this stage`);
    }
    if (existingInvoice) {
      throw Error(
        `An invoice with number ${existingInvoice.invoiceNumber} was already created for order ${order.code}`
      );
    }
    const { invoiceNumber, customerEmail, tmpFileName } =
      await this.generateInvoice(ctx, config.templateString!, order, adminUserId);
    const storageReference = await this.config.storageStrategy.save(
      tmpFileName,
      invoiceNumber,
      channelToken
    );
    return this.saveInvoice(ctx,{
      channelId: ctx.channelId as string,
      invoiceNumber,
      orderId: orderId as string,
      customerEmail,
      orderCode: order.code,
      storageReference,
    });
  }

  /**
   * Just generates PDF, no storing in DB
   */
  async generateInvoice(
    ctx: RequestContext,
    templateString: string,
    order: Order,
    adminUserId: ID
  ): Promise<{ tmpFileName: string } & InvoiceData> {
    const latestInvoiceNumber = await this.getLatestInvoiceNumber(ctx,
      ctx.channelId as string
    );
    const adminRepo= this.connection.getRepository(ctx, Administrator);
    const issuer= await adminRepo.
    findOne({where:{user:{id: adminUserId}}, /*select:['id', 'customFields', 'firstName','lastName']*/});
    const data = await this.config.dataStrategy.getData({
      ctx,
      injector: new Injector(this.moduleRef),
      order: await this.priceReflectionService.reflectSurchargesOnOrder(ctx, order),
      latestInvoiceNumber,
    });
    const tmpFilePath = await createTempFile('.pdf');
    const html = templateString;
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      timeout: 1000 * 60 * 5, // 5 min
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      }
    };
    const withholding:number= this.orderService.calculateWithholdingTax(order);
    const totalTax:number= Math.round(order.subTotal*(0.15)*100)/100;
    const document = {
      html,
      data: {...data, 'date':order.updatedAt.toDateString(), 
      'totalTax': totalTax,
      'withholdingTax':withholding,
      'issuerFullName': issuer.firstName + ' '+ issuer.lastName,
      'issuerSignature': issuer.customFields.signature.length?`${this.config.etechHost}${issuer.customFields.signature.split(',')[1]}`:'""',
      'time':order.updatedAt.toLocaleTimeString()},
      path: tmpFilePath,
      type: '',
    };
    await pdf.create(document, options);
    return {
      tmpFileName: tmpFilePath,
      invoiceNumber: data.invoiceNumber,
      customerEmail: data.customerEmail,
    };
  }

  async writeStyleSheetToTmp(): Promise<string>{
    let clarityStyleSheetReader= createReadStream('src/plugins/invoice/api/style.css');
    const tmpFilePath = await createTempFile('.css');
    const ws= createWriteStream(tmpFilePath);
    clarityStyleSheetReader.pipe(ws);
    return `<link rel="stylesheet" href="${tmpFilePath}">`;
  }

  /**
   * Generates an invoice for the latest placed order and the given template
   */
  async testTemplate(
    ctx: RequestContext,
    template: string
  ): Promise<ReadStream> {
    // const {
    //   items: [latestOrder],
    // } = await this.orderService.findAll(ctx, {
    //   // sort: { orderPlacedAt: 'ASC' as any },
    //   filter: {state: {eq: 'ArrangingPayment'},},
    //   take: 1,
    //   skip: 2,
    // });
    let latestOrder= await this.orderService.findOneByCode(ctx, '0413234');
    const config = await this.getConfig(ctx,ctx.channelId as string);
    if (!config) {
      throw Error(`No config found for channel ${ctx.channel.token}`);
    }
    const { tmpFileName } = await this.generateInvoice(
      ctx,
      template,
      latestOrder,
      ctx.activeUserId
    );
    return createReadStream(tmpFileName);
  }

  /**
   * Returns a redirect if a publicUrl is created
   * otherwise returns a ReadStream from a file
   */
  async downloadInvoice(ctx: RequestContext,input: DownloadInput): Promise<ReadStream | string> {
    const currentUser= await getCurrentUser(ctx.req, this.configService.authOptions.tokenMethod);
    if(currentUser){
      const channel = await this.channelService.getChannelFromToken(
        input.channelToken
      );
      let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
      const invoice = await invoiceRepo.findOne({
        orderCode: input.orderCode,
      });
      if(currentUser instanceof Administrator || currentUser.emailAddress === invoice.customerEmail ){
        if (channel.token != input.channelToken) {
          throw Error(`Channel ${input.channelToken} doesn't exist`);
        } else if (!invoice) {
          throw Error(`No invoice exists for ${input.orderCode}`);
        } else if (invoice.customerEmail !== input.customerEmail) {
          throw Error(
            `This invoice doesnt belong to customer ${input.customerEmail}`
          );
        } else if (invoice.channelId != channel.id) {
          throw Error(
            `This invoice doesnt belong to channel ${input.channelToken}`
          );
        }
        const strategy = this.config.storageStrategy;
        try {
          if ((strategy as RemoteStorageStrategy).getPublicUrl) {
            return await (strategy as RemoteStorageStrategy).getPublicUrl(invoice);
          } else {
            return await (strategy as LocalStorageStrategy).streamFile(
              invoice,
              input.res
            );
          }
        } catch (error) {
          Logger.error(
            `Failed to download invoice ${invoice.invoiceNumber} for channel ${input.channelToken}`
          );
          throw error;
        }
      }
    }
  }

  async downloadMultiple(
    ctx: RequestContext,
    channelId: string,
    invoiceNumbers: string[],
    res: Response
  ): Promise<ReadStream> {
    const nrSelectors = invoiceNumbers.map((i) => ({
      invoiceNumber: i,
      channelId,
    }));
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    const invoices = await invoiceRepo.find({
      where: nrSelectors,
    });
    if (!invoices) {
      throw Error(
        `No invoices found for channel ${channelId} and invoiceNumbers ${invoiceNumbers}`
      );
    }
    return this.config.storageStrategy.streamMultiple(invoices, res);
  }

  async upsertConfig(
    ctx: RequestContext,
    channelId: string,
    input: InvoiceConfigInput
  ): Promise<InvoiceConfigEntity> {
    let configRepo = this.connection.getRepository(ctx,InvoiceConfigEntity);
    const existing = await configRepo.findOne({ channelId });
    if (existing) {
      await configRepo.update(existing.id, input);
    } else {
      await configRepo.insert({ ...input, channelId });
    }
    return configRepo.findOneOrFail({ channelId });
  }

  async getConfig(ctx: RequestContext,channelId: string): Promise<InvoiceConfigEntity | undefined> {
    let configRepo = this.connection.getRepository(ctx,InvoiceConfigEntity);
    let config = await configRepo.findOne({ channelId });
    if (!config) {
      // sample config for display
      config = {
        id: channelId,
        channelId,
        createdAt: new Date(),
        updatedAt: new Date(),
        enabled: false,
      };
    }
    if (!config.templateString || !config.templateString.trim()) {
      config.templateString = defaultTemplate;
    }
    return config;
  }

  async isInvoicePluginEnabled(ctx: RequestContext,channelId: string): Promise<boolean> {
    let configRepo = this.connection.getRepository(ctx,InvoiceConfigEntity);
    const result = await configRepo.findOne({
      // select: ['enabled','channelId'],
      where: { channelId },
    });
    return !!result?.enabled;
  }

  async getInvoice(ctx: RequestContext,orderId: string): Promise<InvoiceEntity | undefined> {
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    return invoiceRepo.findOne({ orderId });
  }

  async getInvoiceWithCode(ctx: RequestContext,channel: Channel,orderCode: string): Promise<Invoice | undefined> {
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    let invoiceEntity= await invoiceRepo.findOne({ orderCode });
    return {
      ...invoiceEntity,
      id: invoiceEntity.id as string,
      //${this.config.etechHost}
      downloadUrl: `/invoices/${channel.token}/${invoiceEntity.orderCode}?email=${invoiceEntity.customerEmail}`,
    }
  }


  /**
   * Get most recent invoice for this channel
   */
  async getLatestInvoiceNumber(ctx: RequestContext,channelId: string): Promise<number | undefined> {
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    const result = await invoiceRepo.findOne({
      where: [{ channelId }],
      // select: ['invoiceNumber','channelId'],
      order: { invoiceNumber: 'DESC' },
      cache: false,
    });
    return result?.invoiceNumber;
  }

  async getAllInvoices(
    ctx: RequestContext,
    channel: Channel,
    input?: InvoicesListInput
  ): Promise<InvoiceList> {
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    let skip = 0;
    let take = 25;
    if (input) {
      take = input.itemsPerPage;
      skip = input.page > 1 ? take * (input.page - 1) : 0;
    }
    const [invoices, totalItems] = await invoiceRepo.findAndCount({
      where: [{ channelId: channel.id }],
      order: { invoiceNumber: 'DESC' },
      skip,
      take,
    });
    const invoicesWithUrl = invoices.map((invoice) => ({
      ...invoice,
      id: invoice.id as string,
      //${this.config.etechHost}
      downloadUrl: `/invoices/${channel.token}/${invoice.orderCode}?email=${invoice.customerEmail}`,
    }));
    return {
      items: invoicesWithUrl,
      totalItems,
    };
  }

  async getMyInvoices(
    ctx: RequestContext,
    channel: Channel,
    input: MyInvoicesInput
  ): Promise<InvoiceList> {
    let skip = 0;
    let take = 25;
    if (input.list) {
      take = input.list.itemsPerPage;
      skip = input.list.page > 1 ? take * (input.list.page - 1) : 0;
    }
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    const [invoices, totalItems] = await invoiceRepo.findAndCount({
      where: [{ channelId: channel.id, customerEmail: input.customerEmail}],
      order: { invoiceNumber: 'DESC' },
      skip,
      take,
    });
    const invoicesWithUrl = invoices.map((invoice) => ({
      ...invoice,
      id: invoice.id as string,
      //${this.config.etechHost}
      downloadUrl: `/invoices/${channel.token}/${invoice.orderCode}?email=${invoice.customerEmail}`,
    }));
    return {
      items: invoicesWithUrl,
      totalItems,
    };
  }

  private async saveInvoice(
    ctx: RequestContext,
    invoice: Omit<InvoiceEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<InvoiceEntity | undefined> {
    let invoiceRepo = this.connection.getRepository(ctx,InvoiceEntity);
    return invoiceRepo.save(invoice);
  }

  private async createCtx(channelToken: string): Promise<RequestContext> {
    const channel = await this.channelService.getChannelFromToken(channelToken);
    return new RequestContext({
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      channel,
    });
  }
}
