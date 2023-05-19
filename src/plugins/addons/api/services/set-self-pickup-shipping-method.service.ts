import { ActiveOrderService, InternalServerError, Order, OrderService, RequestContext, ShippingMethod, ShippingMethodService, TransactionalConnection } from '@etech/core';
import {Injectable} from '@nestjs/common';
import { defaultShippingCalculator } from '@etech/core';
@Injectable()
export class SetSelfPickupAsShippineMethodService{
    constructor(private connection:TransactionalConnection, private orderService: OrderService,
        private activeOrderService: ActiveOrderService){}

    async set(ctx:RequestContext){
        try{
            const activeOrder= await this.activeOrderService.getOrderFromContext(ctx);
            console.log(ctx.req.cookies);
            if(activeOrder){
                const shippingMethodsWithDefaultShippingCalculator= 
                await this.connection.getRepository(ShippingMethod).createQueryBuilder('shippingMethod')
                .getMany();
                const selfPickUpShippingMethod= 
                shippingMethodsWithDefaultShippingCalculator.find((shippingMethod)=>  
                shippingMethod.calculator.code === defaultShippingCalculator.code &&
                shippingMethod.calculator.args.find((arg)=> arg.name === 'rate' && arg.value=='0'));
                if(selfPickUpShippingMethod){
                    const updatedOrder= await this.orderService.setShippingMethod(ctx,activeOrder.id,selfPickUpShippingMethod.id);
                    if(updatedOrder instanceof Order){
                        return {success:true};
                    }
                    console.log(`error while setting shipment for active order ${updatedOrder}`)
                    return {success:false};
                }else{
                    console.log('no default shipping calculator with rate 0')
                    return {success:false};
                }
            }else{
                console.log('no active order');
                return {success:false};
            }
        }catch(e){
            console.log(`error while SetSelfPickupAsShippineMethodService, ${e.message}`)
            return {success:false};
        }
    }

}