import { AdministratorService, EventBus, OrderStateTransitionEvent, TransactionalConnection,Transaction, Ctx, RequestContext, ID, ProductService, Product, UserService, ProcessContext, RefundStateTransitionEvent, FulfillmentStateTransitionEvent, OrderService, FulfillmentEvent, OrderEvent, Fulfillment, Administrator, Order } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { default as dayjs } from 'dayjs';
import { OrderRelatedActivityLogEntity } from '../entities/order-related-activity-log.entity';
import{getRepository, In} from 'typeorm';
@Injectable()
export class OrderRelatedActivityLogService  extends ActivityLogService<OrderStateTransitionEvent | RefundStateTransitionEvent | FulfillmentStateTransitionEvent> implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        let repo= this.transactionalConnection.getRepository(ctx, OrderRelatedActivityLogEntity);
        await repo.softDelete(id);
        return true;
    }
    
    constructor(private eventBus: EventBus, 
        private processContext: ProcessContext,
        private adminService: AdministratorService, 
        private productService: ProductService,
        private orderService: OrderService,
        private transactionalConnection: TransactionalConnection){
        super();
    }

    @Transaction()
    async registerLog(event: OrderStateTransitionEvent | RefundStateTransitionEvent 
         | FulfillmentEvent | OrderEvent | FulfillmentStateTransitionEvent){
        let repo= this.transactionalConnection.getRepository(event.ctx, OrderRelatedActivityLogEntity);
        let log= new OrderRelatedActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const orderRepo= this.transactionalConnection.getRepository(event.ctx, Order);
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}}, 
                // select:['id', 'firstName', 'lastName','user']
            });
            log.admin= currentAdmin;
            if(event instanceof OrderStateTransitionEvent){
                log.type= 'order_state_transition';
                log.description= `
                <a href="./settings/administrators/${currentAdmin.id}">
                    ${currentAdmin.firstName} ${currentAdmin.lastName} 
                </a>
                transitioned order 
                <a href="./orders/${event.order.id}">
                    ${event.order.code} 
                </a>
                    from ${event.fromState} state to  ${event.toState} state`
                log.change= {id: event.order.id, fromState: event.fromState, toState: event.toState};
                log.entity= event.order;
            }else if(event instanceof RefundStateTransitionEvent){
                log.type= 'refund_state_transition';
                log.description= `
                <a href="./settings/administrators/${currentAdmin.id}">
                    ${currentAdmin.firstName} ${currentAdmin.lastName} 
                </a>
                transitioned order 
                <a href="./orders/${event.order.id}">
                    ${event.order.code}
                </a>
                    's refund from ${event.fromState} state to  ${event.toState} state`;
                log.refund= event.refund;
                log.change= {id: event.refund.id, fromState: event.fromState, toState: event.toState};
                log.entity= event.order;
            }else if(event instanceof FulfillmentEvent){
                if(event.type === 'created' || event.type === 'deleted'){
                    const order= await this.orderService.findOneByOrderLineId(event.ctx, event.entity.orderItems[0].lineId);
                    const fulfillmentRepo= getRepository(Fulfillment);
                    if(! await fulfillmentRepo.count({where:{id: event.entity.id}})){
                        return;
                    }
                    log.type= 'fulfillment_state_transition';
                    log.description= `
                    <a href="./settings/administrators/${currentAdmin.id}">
                        ${currentAdmin.firstName} ${currentAdmin.lastName} 
                    </a>
                    created fullfillment for order  
                    <a href="./orders/${order.id}"> ${order.code} </a>`;
                    log.fulfillment= event.entity;
                    log.change= {id: event.entity.id};
                    log.entity= order;
                }
            }
            else if(event instanceof OrderEvent){
                // if(currentAdmin && (event.type === 'created' || event.type === 'deleted')){
                    log.type= event.type;
                    log.description= `
                        <a href="./settings/administrators/${currentAdmin.id}">
                            ${currentAdmin.firstName} ${currentAdmin.lastName}
                        </a>
                        ${event.type} order 
                        <a href="./orders/${event.order.id}"> 
                            ${event.order.code} 
                        </a>
                     `;
                    log.change= {id: event.order.id, type: event.type};
                    log.entity= event.order;
                // }
            }
            else if (event instanceof FulfillmentStateTransitionEvent){
            // const order= await orderRepo.findOne({where:{lines:{id: event.fulfillment.orderItems[0].lineId}, /*select:['id', 'code','lines']*/}});
            const order= await this.orderService.findOneByOrderLineId(event.ctx, event.fulfillment.orderItems[0].lineId);    
            log.type= 'fulfillment_state_transition';
                log.description= `
                <a href="./settings/administrators/${currentAdmin.id}">
                    ${currentAdmin.firstName} ${currentAdmin.lastName}
                </a> 
                transitioned order
                <a href="./orders/${order.id}"> 
                    ${order.code}
                </a>
                    's fullfillment from ${event.fromState} state to  ${event.toState} state`;
                log.fulfillment= event.fulfillment;
                log.change= {id: event.fulfillment.id, fromState: event.fromState, toState: event.toState};
                log.entity= order;
            }else{
                console.log('this shouldnt happen')
            }
            log.createdAt= event.createdAt;
            await repo.save(log);
        }
        else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this order need to be marked expired
            if(!((event instanceof OrderEvent && event.type === 'created')
            || (event instanceof OrderStateTransitionEvent && event.fromState === 'Created' && event.toState === 'AddingItems'))){
                console.log(`all changes for order createdAt ${event.createdAt} need to marked 
                activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
            }
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext,filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        let allLogsSelectQueryBuilder= this.transactionalConnection.getRepository(ctx, OrderRelatedActivityLogEntity)
        .createQueryBuilder('log')
        .innerJoin('log.admin','admin')
        .andWhere(`log.deletedAt IS NULL`)
        .orderBy('log.createdAt','DESC');
        allLogsSelectQueryBuilder= this.addFilterToQueryBuilder(allLogsSelectQueryBuilder, filter);
        const allLogs= await allLogsSelectQueryBuilder.getMany();
        let readableLogs:ActivityLog[]=[]
        for(let log of allLogs){
            readableLogs.push({
                id: log.id,
                description: log.description,
                latest: false,
                dateTime: log.updatedAt,
            })
        }
        return readableLogs;
    }

    async revertChanges(ctx:RequestContext, id:ID):Promise<Boolean>{
        throw new NotImplementedException();
    }

    onApplicationBootstrap() {
        if(this.processContext.isServer){
            this.eventBus.ofType(OrderStateTransitionEvent).subscribe((async (event)=>{
                await this.registerLog(event);
            }));
            this.eventBus.ofType(RefundStateTransitionEvent).subscribe((async (event)=>{
                await this.registerLog(event);
            }));
            this.eventBus.ofType(FulfillmentStateTransitionEvent).subscribe((async (event)=>{
                await this.registerLog(event);
            }));
            this.eventBus.ofType(FulfillmentEvent).subscribe((async (event)=>{
                await this.registerLog(event);
            }));
            this.eventBus.ofType(OrderEvent).subscribe((async (event)=>{
                await this.registerLog(event);
            }));
        }
    }

}