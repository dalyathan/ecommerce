import { CustomOrderProcess, EntityHydrator, Order, OrderService } from "@etech/core";
import {getRepository} from 'typeorm';
let entityHydrator: EntityHydrator;
let orderService: OrderService;
export const updateAllowCustomerPaymentCustomFieldProcess: CustomOrderProcess<'AddingItems'> = {
    init(injector) {
      entityHydrator = injector.get(EntityHydrator);
      orderService= injector.get(OrderService);
    },
    async onTransitionStart(fromState, toState, data) {
        if(fromState  === 'AddingItems' && toState === 'ArrangingPayment'){
            const orderRepo= getRepository(Order);
            console.log('incoming');
            const currentOrder= await orderService.findOne(data.ctx,data.order.id, 
                ["lines", "lines.productVariant", "shippingLines"]);
                currentOrder.customFields.allow_customer_payment= true;
                for(const line of currentOrder.lines){
                    await entityHydrator.hydrate(data.ctx, line.productVariant, {relations:["product"]})
                    currentOrder.customFields.allow_customer_payment= 
                    currentOrder.customFields.allow_customer_payment 
                    && !line.productVariant.product.customFields.is_order_based;
                }
            if(!currentOrder.customFields.allow_customer_payment){
                await orderRepo.save(currentOrder);
            }
        }
    },
  };