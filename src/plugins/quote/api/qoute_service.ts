import { ProductService,
     OrderService, RequestContext, TransactionalConnection, ProductVariantService, ProductVariant, 
     AdministratorService, CustomerService, EventBus, ShowNotificationEvent, Administrator, Order, Customer, ActiveOrderService,
    
 
} from '@etech/core';
import {BadRequestException} from '@nestjs/common';
import {Injectable} from '@nestjs/common'
import { Quote } from './quote_entity'
import {getRepository,FindConditions} from 'typeorm'
import { CompanyService } from '../../company-info/company.service';
import * as fs from 'fs';

import { Type } from '../../cms/e2e/types/generated-shop-types';

import {genPdfFromHtml} from './pdf.generator'
import { CmsService } from '../../cms/service/cms.service';
import {QuoteFilter, QuoteInputType} from '../ui/generated-admin-types';
import { EmailService } from '../../addons/api/services/email.service';
@Injectable()
export class QuoteService{
    constructor(private productService: ProductService,
     private infoSvc: CompanyService,
     private cmsService: CmsService,
     private productVariantService: ProductVariantService,
     private transactionConnection: TransactionalConnection,
     private emailService: EmailService,
     private eventBus: EventBus,
     private activeOrderService: ActiveOrderService
     ) {}

    async approve(ctx:RequestContext, id: string, ): Promise<Quote>{
     try{
          let adminName: string = "--";
          let adminId = ctx.activeUserId;
          if(adminId){
          //   console.log(`Getting use by ${adminId}`);
          const adminRepo= this.transactionConnection.getRepository(ctx, Administrator);
          const admin= await adminRepo.findOne({where:{user:{id: ctx.activeUserId}},
               //  select:['firstName', 'lastName','id','user']
               });
           if(admin){
               adminName= admin.firstName+' '+admin.lastName;
           }
          //   console.log({adminName});
          }
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne(id)
          if(!quote.isApproved){
               quote.isApproved = true;
               quote.adminName = adminName;
               try{

                    await this.emailService.sendMail(quote.fromEmail, 
                         "Follow up on the quote you requested", 
                         `<a href='${process.env.ECOMMERCE_SERVER_NAME}${quote.assetUrl}'> Here</a> is the quote you requested. `);
                    return await repo.save(quote);
               }catch(e){
                    console.log(e);
                    throw Error('Unabel to send email to customer');
               }
          }
          // return true;
     }catch(e){
          console.warn(e.message);
          // return false
     }
    }

     async addQuote(ctx: RequestContext,input:QuoteInputType){
          const quote = new Quote()
          const activeUserId = ctx.activeUserId
          const activeOrder = await this.activeOrderService.getOrderFromContext(ctx);
          if(activeOrder){
               quote.orderRef = activeOrder.code;
               console.log('activeOrder',activeOrder);
          }else{
               console.log('no active order')
          }
          quote.fromEmail = input.fromEmail;
          quote.msg = input.msg;
          quote.subject = input.subject;
          quote.fromPhone = input.fromPhone;
          quote.location = input.location;
          //if the user has logged in productDescr will be the email. else productDescr is empty
          //then when getQueryOf is called the email sent will be compared against productDescr
          //    quote.productDescr = input.productDescr
          quote.isSpecial = input.isSpecial
          quote.companyName = input.companyName ? input.companyName:'';
          quote.userEmail = input.productDescr ? input.productDescr:'';
          const repo= getRepository(ProductVariant);
          let products: ProductVariant[] = (input.productIds) ? await repo.findByIds(input.productIds, {join:{
               alias: "variant",
               leftJoinAndSelect:{
                    product: "variant.product",
               }
          } }) : [];
          quote.forProducts = products
          quote.assetUrl= await this.writeResponsePdf(ctx, quote);
          let savedQuote=await getRepository(Quote).save(quote);
          this.eventBus.publish(
               new ShowNotificationEvent(ctx, `quote request has been submitted`, 
                    `./extensions/quotes`,`Quote Request`,
                    undefined, 30000, 'file',{id: encodeURIComponent(savedQuote.id)}))
          return savedQuote
     }
     
     async getQuotesOf(ctx: RequestContext,email: string): Promise<Quote[]>{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          // console.log( `Getting from email: ${email}`)
          const quotes: Quote[] = await repo.find({ 
               where:{
                    userEmail: email,
                    isApproved: true,
               }
          })
          return quotes;
     }
     
     async getQuote(ctx :RequestContext, id: string): Promise<Quote | null >{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne({id},{relations: ['forProducts']})

          return quote as Quote;
     }

     async deleteQuote(ctx :RequestContext, id: string): Promise<Quote>{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne(id)
          if(!quote) return
          await repo.delete(quote.id);
          return quote
     }

     async writeResponsePdf(ctx: RequestContext, quote: Quote): Promise<string>{
                  if(!quote) 
                    throw new BadRequestException("Error quote not found!");
               //   if(!(quote.isApproved)) 
                 //   throw new BadRequestException("Error this quote is not approved yet!")
                   const companyInfo = await this.infoSvc.getComapnyInfo(ctx);

                  const json = (await (await this.cmsService.findOne(ctx, Type.POLICIES)).content).join(',');
          
                  const conData = JSON.parse(json)
                  //console.log({conData})
                  const terms=  (((conData as []).
                               find(data=> (data as {name: string}).name === 'TERMS AND CONDITIONS')) as {description: string})
                              .description;
                  //this.cmsResolver. getCms(ctx, [Type.POLICIES])["TERMS AND CONDITIONS"]
                  const products = []  
                  //  quote.forProducts?.forEach( async product => {
                  //console.warn("data ", await this.productVariantService.getProductForVariant(ctx, product as unknown as  ProductVariant))})
                   let title = "";
                  const specs = [];
                  const accs = [];
                  quote.forProducts?.forEach( async product => {
                    // console.log('Variant Custom Fields ',  product.customFields)
                    const acc = (product?.customFields as any).accessories
                    if(acc) accs.push(acc);

                    const pro =  await this.productVariantService.getProductForVariant(ctx, product);
                     //console.log("ll#")
                    //  console.log('product custom field', pro.customFields)
                    specs.push({name: product.translations[0].name, descr:   pro.translations[0].description, price: 
                       ( (product.productVariantPrices[0].price)/100).toString() + " ETB"
                    })
                  //  console.log('lspecs ', {specs})
                  })
               //    console.log({accs})

                  /// we get the accessory entities here
                  let subTotal = 0;
                  let priceWithTaxTotal = 0;
                  const orderRepo= this.transactionConnection.getRepository(ctx, Order);
                  const order = await orderRepo.findOne({where:{code:quote.orderRef},
                    //  select:['subTotal','subTotalWithTax','code']
                    });
               //    console.log({order})
               if(order){
                    //this should happen only when playground is used for testing purposes only
                    subTotal = order.subTotal;
                    priceWithTaxTotal = order.subTotalWithTax;
               }

                  let accEntities = [];
                  let accIds = []


                  accs.forEach(acc =>{
                      accIds = accIds.concat( (acc as string).trim().split(',') )
                  })
               //    console.log(accIds);
                 if(accIds.length) accEntities = await this.productService.findByIds(ctx, accIds);
               //    console.log({accEntities})
               //    accEntities = accEntities.map(async entity => {
               //      if(!entity) return en;
               //      // console.log('test1', {entity})
               //       // const var
                     
               //      const vars = await this.productVariantService.getVariantsByProductId(ctx, entity.id);
               //      entity.price = "--"
               //      if(!vars.items.length ) return entity;
               //      console.log(vars.items[0], 'trans'); 
               //      const price = await this.productVariantService.hydratePriceFields(ctx, vars.items[0], 'price');
               //      const priceWithTax = await this.productVariantService.hydratePriceFields(ctx, vars[0], 'priceWithTax');
               //      entity.price = priceWithTax;
               //      return entity
               //    })
                  const temp =[];
                  console.clear();
                  for(let i=0;i<accEntities.length;i++){
                    const entity = accEntities[i];
                    if(!entity) continue;
                    // console.log('test1', {entity})
                     // const var
                     
                    const vars = await this.productVariantService.getVariantsByProductId(ctx, entity.id);
                    // console.log('EntityID ', entity.id)
                    // console.log('Entity', vars.items.length)
                    entity.price = "--"
                    if((vars.totalItems) ){
                         // console.log(vars.items[0], 'trans'); 
                         const price = await this.productVariantService.hydratePriceFields(ctx, vars.items[0], 'price');
                         const priceWithTax = await this.productVariantService.hydratePriceFields(ctx, vars.items[0], 'priceWithTax');
                         entity.price = priceWithTax/100 + " ETB";
                         
                    }
                    temp.push(entity)
                  }
                 
               //    console.log({accEntities});
               //    console.log('--------------------')
                  accEntities = temp;
               //    console.log({accEntities})

                  /*await quote.forProducts?.forEach( async product => */
                  for(let i=0;i<quote.forProducts?.length;i++){ //console.log('loop', product)
                      const product = quote.forProducts[i];
                      title += product.translations[0].name + ",";
                      const t = await this.productVariantService.getProductForVariant(ctx, product as
                         unknown as  ProductVariant);
                         const pro =  await this.productVariantService.getProductForVariant(ctx, product);
                      
                      products.push({ 
                         ref: quote.orderRef, 
                         sku: product.sku,
                         name: product.translations[0].name, 
                         descr:  pro.translations[0].description, 
                         price: ( (product.productVariantPrices[0].price)/100).toString() + " ETB"
                      })
                    //   console.log(`<td style="border: 1px solid lightblue;">${pro.translations[0].description}</td>`)
                   }
                   const infos = await this.infoSvc.getComapnyInfo(ctx)
                  //console.warn("real product ", {products})
                  const comm_bank = infos.commercial_bank
                  const dashen = infos.dashen_bank;
                  const tele_birr =  infos.tele_birr;
                
                  /*  {{comm_bank}}<br />
      Dashen Bank: {{dashen}}<br />
      Telebirr: {{tele_birr}} */
               //    console.log('order REFFFF', quote.orderRef)
                  const data = 
                  {access: accEntities,ref: quote.orderRef,
                    specs  :  specs,
                    location_text: companyInfo['location_text'], q_ref: quote.uuid,
                  subject: quote.subject,
                  general_terms: terms,
                  date: new Date().toDateString(),
                  admin: quote.adminName,
                  products,
                  tax: priceWithTaxTotal/100 + " ETB",
                  sub_total: (subTotal/100) + " ETB",
                  priceWithTaxTotal,
                  product_title: title,
                  tele_birr,
                  comm_bank,
                  dashen,
                  made_out_email: quote.fromEmail, made_out_phone: quote.fromPhone,}
                   
                  return await genPdfFromHtml(data)



   
     }

     async downloadResponsePdf(ctx: RequestContext, id: string): Promise<string>{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne({id})
          if(quote && quote.isseen && quote.assetUrl && quote.assetUrl !== ""){
               return quote.assetUrl;
          }
          return "";
     }
     async myQuotes(ctx: RequestContext,filter: QuoteFilter): Promise<Quote []>{
          
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          let applyWhereClause:FindConditions<Quote>={};
          if(filter && filter.isApproved!=undefined && filter.isApproved!=null){
               applyWhereClause={...applyWhereClause,isApproved:filter.isApproved}
          }
          if(filter && filter.isSeen!=undefined && filter.isSeen!=null){
               applyWhereClause={...applyWhereClause, isseen:filter.isSeen}
          }
          return await repo.find({where:applyWhereClause, relations: ['forProducts'], order:{
               createdAt:'DESC'
          }});

     }
      
     async customerQuotes(ctx: RequestContext, customerEmail: String):Promise<String[]>{
          const quoteRepo = this.transactionConnection.getRepository(ctx, Quote);
          const customerRepo= this.transactionConnection.getRepository(ctx, Customer);
          if(ctx.activeUserId){
               if(ctx.apiType== 'shop'){
                    let customer= await customerRepo.findOne({where:{user:ctx.activeUserId}, select:['emailAddress','user']});
                    if(customer.emailAddress !== customerEmail){
                         return [];
                    }
               }
               return (await  quoteRepo.find({
                    where:{
                         userEmail: customerEmail
                    }
               })).map((item)=> item.assetUrl);
          }
          return [];
     }

     async seen(ctx :RequestContext, id: string): Promise<Quote>{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne({id})
          // console.log("seen quote, ", quote)
          if(!quote ) return; 
          quote.isseen = true;
          await repo.save(quote);
          return quote;
     }

     async regenerateQuote(ctx :RequestContext, id: string):  Promise<Quote>{
          const repo = this.transactionConnection.getRepository(ctx, Quote);
          const quote = await repo.findOne(id,
               {join:{
                    alias: "quote",
                    leftJoinAndSelect:{
                         forProducts: "quote.forProducts",
                         translations: "forProducts.translations",
                         productVariantPrices: "forProducts.productVariantPrices"
                    }
                  }});
          const existingFileName = `./static${quote.assetUrl}`;
          quote.assetUrl= await this.writeResponsePdf(ctx, quote);
          quote.isApproved= false;
          fs.unlinkSync(existingFileName);
          return await repo.save(quote);
     }
}
