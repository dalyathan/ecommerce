import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Order, OrderService, EntityHydrator, } from '@etech/core';
@Resolver('Order')
export class OrderFieldExtension{
    constructor(private orderService: OrderService, private entityHydrator: EntityHydrator){

    }

    @ResolveField()
    async witholdingTax(@Ctx() ctx: RequestContext, @Parent() order: Order):Promise<number> {
        return Math.round(order.subTotal*(1.15)-order.subTotalWithTax);
    }
}