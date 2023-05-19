import { EntityHydrator, EventBus, Order, OrderLineEvent, OrderService, ProcessContext, TransactionalConnection } from "@etech/core";
import { Injectable,OnModuleInit } from "@nestjs/common";

@Injectable()
export class UpdateAllowCustomerPayemntService implements OnModuleInit{
    constructor(private eventBus: EventBus, private orderService: OrderService,
        private entityHydrator:EntityHydrator, private connection: TransactionalConnection,
        private processContext: ProcessContext){

    }
    onModuleInit() {
        if(this.processContext.isServer){
            this.updateOrder();
        }
    }

    updateOrder(){
        this.eventBus.ofType(OrderLineEvent).subscribe((async (event)=>{
            const currentOrder= await this.orderService.findOne(event.ctx,event.order.id, 
                ["lines", "lines.productVariant", "shippingLines"]);
                currentOrder.customFields.allow_customer_payment= true;
                for(const line of currentOrder.lines){
                    await this.entityHydrator.hydrate(event.ctx, line.productVariant, {relations:["product"]})
                    currentOrder.customFields.allow_customer_payment= 
                    currentOrder.customFields.allow_customer_payment 
                    && !line.productVariant.product.customFields.is_order_based;
                }
            if(!currentOrder.customFields.allow_customer_payment){
                const orderRepo= this.connection.getRepository(event.ctx,Order);
                await orderRepo.save(currentOrder);
            }
        }));
    }
}