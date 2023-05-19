import { Order, RequestContext,Ctx, OrderService, OrderLine, Surcharge } from '@etech/core';
import {
    Injectable
  } from '@nestjs/common';
@Injectable()
export class ReflectSurchargesOnOrderService{
    constructor(private orderService:OrderService){

    }

    async reflectSurchargesOnOrder(@Ctx() ctx: RequestContext, order:Order):Promise<Order>{
        const hydratedOrder= await this.orderService.findOne(ctx,order.id, 
            ["lines", "lines.productVariant", "shippingLines",'lines.items','customer']);
        const updatedLines=[];
        for(let line of hydratedOrder.lines){
            const relevantSurchargesForVariant= order.surcharges.filter((one)=> one.sku === line.productVariant.sku);
            updatedLines.push(
                this.reflectSurchargesOnOrderLine(ctx, 
                line,
                relevantSurchargesForVariant
                    ))
        }
        hydratedOrder.lines=updatedLines;
        return hydratedOrder;
    }

     reflectSurchargesOnOrderLine(@Ctx() ctx: RequestContext, 
     orderLine:OrderLine, relevantSurchargesForVariant: Surcharge[]):OrderLine{
        if(relevantSurchargesForVariant.length){
            const reducedSurchagesPrice= relevantSurchargesForVariant
            .map((item)=> item.price)
            .reduce(((soFar, current)=> soFar+current));
            const reducedSurchagesPriceWithTax= relevantSurchargesForVariant
            .map((item)=> item.priceWithTax)
            .reduce(((soFar, current)=> soFar+current));
           return new OrderLine({...orderLine, 
            discountedUnitPrice: orderLine.discountedUnitPrice + reducedSurchagesPrice,
            discountedUnitPriceWithTax: orderLine.discountedUnitPriceWithTax + reducedSurchagesPriceWithTax,
            discountedLinePrice: orderLine.discountedLinePrice + reducedSurchagesPrice*orderLine.quantity,
            discountedLinePriceWithTax: orderLine.discountedLinePriceWithTax + reducedSurchagesPriceWithTax*orderLine.quantity,
        });
        }else{
            return orderLine;
        }
    }

    //  reflectSurchargesOnOrderLinePriceWithTax(@Ctx() ctx: RequestContext, 
    // orderLine:OrderLine, relevantSurchargesForVariant: Surcharge[]):OrderLine{
    //     if(relevantSurchargesForVariant.length){
    //         const reducedSurchagesPriceWithTax= relevantSurchargesForVariant
    //         .map((item)=> item.priceWithTax)
    //         .reduce(((soFar, current)=> soFar+current));
    //         return new OrderLine({...orderLine, 
    //             discountedLinePriceWithTax: orderLine.discountedLinePriceWithTax + reducedSurchagesPriceWithTax*orderLine.quantity});
    //     }else{
    //         return orderLine;
    //     }
    // }

}