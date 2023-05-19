import { ActiveOrderService, OrderService, RequestContext, TransactionalConnection, UserService } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
import { Success } from '../../generated-shop-types';
@Injectable()
export class ActiveOrderCancellationService{
    constructor(
        private activeOrderService: ActiveOrderService,
        private orderService: OrderService){
        
    }
    async cancelMyOrder(ctx: RequestContext):Promise<Success>{
        try{
            const activeOrder= await this.activeOrderService.getOrderFromContext(ctx);
            if(activeOrder){
                await this.orderService.cancelOrder(ctx, 
                    {orderId: activeOrder.id, cancelShipping: true, reason: 'Customer Request'});
                    return {success: true};
            }
            console.log('no active order')
        }catch(e){
            console.log(e)
        }
        return {success: false}
    }

    async isActiveOrderPayable(ctx: RequestContext):Promise<Success>{
        try{
            const activeOrder= await this.activeOrderService.getOrderFromContext(ctx);
            return {success: activeOrder.customFields.allow_customer_payment};
        }catch(e){
            return {success: false}
        }
    }

}