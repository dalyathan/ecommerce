import { RequestContext, OrderLine, TransactionalConnection, ID, CustomerGroupService, 
  UserService, ChannelService } from '@etech/core';
import { SalesReport, SalesReportContent, SalesReportFilter } from '../../ui/generated-admin-types';
import {Injectable} from '@nestjs/common';

@Injectable()
export class SalesReportService{
    constructor(private connection: TransactionalConnection, 
      private userService: UserService,
      private channelService: ChannelService,
      private customerGroupService: CustomerGroupService){
    }

    async getSalesReport(ctx: RequestContext, filter: SalesReportFilter): Promise<SalesReport>{
      let dayjs= require('dayjs');
      let userAdmin= await this.userService.getUserById(ctx, ctx.activeUserId);
      let header:string='';  
      let orderLines= this.connection.getRepository(ctx,OrderLine)
        .createQueryBuilder("orderLine")
        .innerJoinAndSelect('orderLine.order','order')
        .innerJoinAndSelect('orderLine.productVariant','productVariant')
        .innerJoinAndSelect('productVariant.translations','translations')
        .innerJoinAndSelect("orderLine.items", "orderItem")
        .leftJoinAndSelect('order.customer','customer')
        .where('order.state="Delivered"');
        // console.log(filter)
        if(filter.orderPlacedAt){
            if(filter.orderPlacedAt.before){
                orderLines= orderLines.andWhere(
                    `order.updatedAt
                     < :end`,
                    {
                      // begin: new Date(0,0,0).toISOString(),
                      end: filter.orderPlacedAt.before,
                    }
                  )
                  header+=` delivered before ${dayjs(filter.orderPlacedAt.before).format('ddd, MMM D, YYYY h:mm A ')}`
            }else if(filter.orderPlacedAt.after){
                orderLines= orderLines.andWhere(
                    `order.updatedAt
                  >= :begin
                    `,
                    {
                      begin: filter.orderPlacedAt.after,
                      // end: new Date().toISOString(),
                    }
                  )
                  header+=` delivered after ${dayjs(filter.orderPlacedAt.after).format('ddd, MMM D, YYYY h:mm A ')}`
            }else if(filter.orderPlacedAt.between){
                orderLines= orderLines.andWhere(
                    `order.updatedAt
                    >= :begin AND
                    order.updatedAt
                    <= :end
                    `,
                    {
                      begin: filter.orderPlacedAt.between.start,
                      end: filter.orderPlacedAt.between.end,
                    }
                  )
                  header+=` delivered between ${dayjs(filter.orderPlacedAt.between.start).format('ddd, MMM D, YYYY h:mm A ')} and 
                  ${dayjs(filter.orderPlacedAt.between.end).format('ddd, MMM D, YYYY h:mm A ')}`
            }else{
              //no condition, suppose to be empty object
              if(Object.keys(filter.orderPlacedAt).length !== 0){
                console.log('Unexpected orderPlacedAt');
              }
            }
        }
        if(filter.taxRate){
          header+=`, subject to ${filter.taxRate}% tax`
          orderLines= orderLines
          .andWhere(`JSON_SEARCH(orderItem.taxLines, 'one', ${filter.taxRate}, NULL, '$[*].taxRate') IS NOT NULL`)
        }
        if(filter.discount){
          header+=`, with ${filter.discount/100} ETB discount`
          orderLines= orderLines
          .andWhere(`(JsonGet_Int(JSON_EXTRACT(orderItem.adjustments, "$[*].amount"),'[+]')) = ${filter.discount*-100}`);
        }
        if(filter.total){
          orderLines= orderLines
          .andWhere(`orderItem.listPrice=${Math.floor(filter.total*100)}`)
        }
        if(filter.productIds && filter.productIds.length){
          orderLines= orderLines
          .andWhere("productVariant.productId IN(:...ids)", { ids: filter.productIds })
        }
        if((filter.customerIds && filter.customerIds.length) || 
           (filter.customerCategoryIds && filter.customerCategoryIds.length) ){
          let customerIds:ID[]=[];
          if(filter.customerIds && filter.customerIds.length){
            customerIds=[...filter.customerIds];
          }
          if(filter.customerCategoryIds && filter.customerCategoryIds.length){
            for(let id of filter.customerCategoryIds){
              customerIds.push(...(await this.customerGroupService.getGroupCustomers(ctx, id)).items.map((customer)=> customer.id))
            }
          }
          if(customerIds){
            orderLines= orderLines
            .andWhere("customer.id IN(:...ids)", { ids: customerIds })
          }
        }
        let lines= await orderLines.getMany();
        let reportContents:SalesReportContent[]=[];
        let customerNames:string[]=[];
        let productNames:string[]=[];
        let this_channel= await this.channelService.findOne(ctx, ctx.channelId);
        for(let line of lines){
          if(filter.productIds && filter.productIds.length){
            if(productNames.indexOf(line.productVariant.translations[0].name) == -1 ){
              productNames.push(line.productVariant.translations[0].name);
            }
          }
          if((filter.customerIds && filter.customerIds.length) || (filter.customerCategoryIds && filter.customerCategoryIds.length) ){
            let customerName= line.order.customer?line.order.customer.firstName + ' '+ line.order.customer.lastName:undefined;
            //technically customerName should never be undefined
            if(customerName && customerNames.indexOf(customerName) == -1 ){
              customerNames.push(customerName);
            }
          }
          reportContents.push({
            productId: line.productVariant.productId,
            orderCode: line.order.code,
            orderId: line.order.id,
            orderPlacedAt: line.order.updatedAt? line.order.updatedAt.toDateString():'',
            customer: line.order.customer? line.order.customer.firstName + ' '+ line.order.customer.lastName:'Guest',
            customerId: line.order.customer?line.order.customer.id:-1,
            sku: line.productVariant.sku,
            unitPrice: `${(this_channel.pricesIncludeTax? line.unitPriceWithTax: line.unitPrice)/100} ETB`,
            totalPrice: `${((this_channel.pricesIncludeTax?line.linePriceWithTax:line.linePrice)/100)} ETB`,
            discount: `${(line.linePrice - line.proratedLinePrice)/100} ETB`,
            taxRate: `${line.taxRate}`,
            taxCollected: `${(line.proratedLinePriceWithTax-line.proratedLinePrice)/100} ETB`,
            totalAmount: `${line.quantity}`,
            paymentMethod: line.order.payments && line.order.payments.length >0 ? line.order.payments[0].method:'None',
          });
        }
        if(productNames.length){
          // console.log(productNames)
          header+=`, involving ${productNames.length>1?
            productNames.slice(0, productNames.length-1).join(', ')+' and '+
            productNames[productNames.length-1]:productNames.join(', ')} 
            product variant${productNames.length>1?'s':''}`
        }
        if(customerNames.length){
          // console.log(customerNames)
          // header+= `, by ${customerNames.join(',')} customer${customerNames.length>1?'s':''}`
          // console.log(reportContents)
          header+=`, made by customer${customerNames.length>1?'s':''} ${customerNames.length>1?
            customerNames.slice(0, customerNames.length-1).join(', ')+' and '+
            customerNames[customerNames.length-1]:customerNames.join(', ')} 
            `
        }
        // console.log(reportContents.length)
        return {
          content: reportContents, 
          header: `This report, generated by ${userAdmin.identifier}, contains ${reportContents.length} delivered sales`+header, 
          priceIncludesTax: this_channel.pricesIncludeTax
        };
    }
}