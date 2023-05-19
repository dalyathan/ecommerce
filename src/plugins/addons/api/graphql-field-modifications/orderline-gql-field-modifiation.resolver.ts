import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Order, OrderService, OrderLine, InternalServerError, } from '@etech/core';
import { ReflectSurchargesOnOrderService } from '../services/order-line-price-modification.service';
@Resolver('OrderLine')
export class OrderLineFieldModification{
    constructor(private orderService: OrderService,private modificationService: ReflectSurchargesOnOrderService){
    }

    @ResolveField()
    async discountedLinePrice(@Ctx() ctx: RequestContext, @Parent() orderLine: OrderLine):Promise<number> {
        const order= await this.orderService.findOneByOrderLineId(ctx, orderLine.id,['lines','lines.productVariant', 
        'surcharges','lines.order','lines.items']);
        if(order){
            const relevantSurcharges= order.surcharges.filter((one)=> one.sku === orderLine.productVariant.sku);
            return this.modificationService.reflectSurchargesOnOrderLine(
                ctx, orderLine,relevantSurcharges).discountedLinePrice;
        }
        throw new InternalServerError('order couldnt be found')
    }

    @ResolveField()
    async discountedLinePriceWithTax(@Ctx() ctx: RequestContext, @Parent() orderLine: OrderLine):Promise<number> {
        const order= await this.orderService.findOneByOrderLineId(ctx, orderLine.id,
            ['lines','lines.productVariant', 'surcharges','lines.order','lines.items']);
        if(order){
            const relevantSurcharges= order.surcharges.filter((one)=> one.sku === orderLine.productVariant.sku);
            return this.modificationService.reflectSurchargesOnOrderLine(ctx, orderLine,relevantSurcharges).discountedLinePriceWithTax;
        }
        throw new InternalServerError('order couldnt be found')
    }

    @ResolveField()
    async discountedUnitPrice(@Ctx() ctx: RequestContext, @Parent() orderLine: OrderLine):Promise<number> {
        const order= await this.orderService.findOneByOrderLineId(ctx, orderLine.id,['lines','lines.productVariant', 
        'surcharges','lines.order','lines.items']);
        if(order){
            const relevantSurcharges= order.surcharges.filter((one)=> one.sku === orderLine.productVariant.sku);
            return this.modificationService.reflectSurchargesOnOrderLine(
                ctx, orderLine,relevantSurcharges).discountedUnitPrice;
        }
        throw new InternalServerError('order couldnt be found')
    }

    @ResolveField()
    async discountedUnitPriceWithTax(@Ctx() ctx: RequestContext, @Parent() orderLine: OrderLine):Promise<number> {
        const order= await this.orderService.findOneByOrderLineId(ctx, orderLine.id,
            ['lines','lines.productVariant', 'surcharges','lines.order','lines.items']);
        if(order){
            const relevantSurcharges= order.surcharges.filter((one)=> one.sku === orderLine.productVariant.sku);
            return this.modificationService.reflectSurchargesOnOrderLine(ctx, orderLine,relevantSurcharges).discountedUnitPriceWithTax;
        }
        throw new InternalServerError('order couldnt be found')
    }
}
