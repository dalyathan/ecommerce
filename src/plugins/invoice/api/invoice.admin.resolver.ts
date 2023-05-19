import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Allow, Ctx, ID, RequestContext, Transaction } from '@etech/core';
import { InvoiceService } from './invoice.service';
import { invoicePermission } from '../index';
import {
  InvoiceConfigInput,
  InvoiceList,
  InvoicesListInput,
} from '../../../ui/generated/graphql';
import { InvoiceConfigEntity } from './entities/invoice-config.entity';
import { InvoiceEntity } from './entities/invoice.entity';

@Resolver()
export class InvoiceAdminApiResolver {
  constructor(private service: InvoiceService) {}

  @Mutation()
  @Allow(invoicePermission.Permission)
  @Transaction()
  async upsertInvoiceConfig(
    @Ctx() ctx: RequestContext,
    @Args('input') input: InvoiceConfigInput
  ): Promise<InvoiceConfigEntity> {
    return this.service.upsertConfig(ctx, ctx.channelId as string, input);
  }

  @Mutation()
  @Allow(invoicePermission.Permission)
  @Transaction()
  async generateInvoice(
    @Ctx() ctx: RequestContext,
    @Args('id') orderId: ID
  ): Promise<void|InvoiceEntity> {
    return this.service.createAndSaveInvoice(ctx.channel.token, orderId, ctx.activeUserId);
  }

  @Query()
  @Allow(invoicePermission.Permission)
  @Transaction()
  async invoiceConfig(
    @Ctx() ctx: RequestContext
  ): Promise<InvoiceConfigEntity | undefined> {
    return this.service.getConfig(ctx, ctx.channelId as string);
  }

  @Query()
  @Allow(invoicePermission.Permission)
  async invoices(
    @Ctx() ctx: RequestContext,
    @Args('input') input?: InvoicesListInput
  ): Promise<InvoiceList> {
    return this.service.getAllInvoices(ctx, ctx.channel, input);
  }

  @Query()
  @Allow(invoicePermission.Permission)
  async myInvoices(
    @Ctx() ctx: RequestContext,
    @Args('input') input?: any
  ): Promise<InvoiceList> {
    return this.service.getAllInvoices(ctx, ctx.channel, input);
  }
}
