import { AdministratorService, EventBus, TransactionalConnection,Transaction, RequestContext, ID, ProcessContext, CustomerEvent, CustomerGroupEntityEvent, CustomerGroupChangeEvent, Administrator } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
// import { ProductActivityLogEntity } from '../entities/product-activity-log.entity';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { default as dayjs } from 'dayjs';
import { CustomerRelatedActivityLogEntity } from '../entities/customer-related-activity-log.entity';
@Injectable()
export class CustomerRelatedActivityLogService  extends ActivityLogService<CustomerEvent|CustomerGroupEntityEvent|CustomerGroupChangeEvent> 
    implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        let repo= this.transactionalConnection.getRepository(ctx, CustomerRelatedActivityLogEntity);
        await repo.softDelete(id);
        return true;
    }

    constructor(
        private eventBus: EventBus, 
        private processContext: ProcessContext,
        private adminService: AdministratorService, 
        private transactionalConnection: TransactionalConnection){
        super();
    }

    @Transaction()
    async registerLog(event: CustomerEvent|CustomerGroupEntityEvent|CustomerGroupChangeEvent){
        const repo= this.transactionalConnection.getRepository(event.ctx, CustomerRelatedActivityLogEntity);
        const log= new CustomerRelatedActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}},
                //  select:['id', 'firstName', 'lastName','user']
                });
            log.admin= currentAdmin;
            if(event instanceof CustomerEvent){
                log.entity= event.entity;
                log.type= event.type;
                if(event.type === 'created' || event.type === 'deleted'){
                    log.change= {id: event.entity.id};
                    if(event.type === 'created'){
                        log.description= `
                            <a href="./catalog/products/${event.entity.id}">
                                ${event.entity.firstName} ${event.entity.lastName}
                            </a> was
                            created by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>.
                        `
                    }
                    else{
                        log.description= `${event.entity.firstName} ${event.entity.lastName} was deleted by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>.
                        `
                    }
                }else{
                    let recentChange=event.input;
                    log.change= recentChange;
                    log.description= `
                    <a href="./catalog/products/${event.entity.id}">
                        ${event.entity.firstName} ${event.entity.lastName}
                    </a> was 
                    updated by 
                    <a href="./settings/administrators/${currentAdmin.id}">
                         ${currentAdmin.firstName} ${currentAdmin.lastName}
                    </a>.
                    `
                }
            }else if(event instanceof CustomerGroupEntityEvent){
                log.customerGroup= event.entity;
                log.type= event.type;
                if(event.type === 'created' || event.type === 'deleted'){
                    log.change= {id: event.entity.id};
                    if(event.type === 'created'){
                        log.description= `Customer Group 
                            <a href="./customer/groups;contents=${event.entity.id}">
                                ${event.entity.name}
                            </a> was
                            created by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>.
                        `
                    }
                    else{
                        log.description= `Customer Group ${event.entity.name} was deleted by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>.
                        `
                    }
                }else{
                    let recentChange=event.input;
                    log.change= recentChange;
                    log.description= `Customer Group 
                    <a href="./customer/groups;contents=${event.entity.id}">
                        ${event.entity.name}
                    </a> was 
                    updated by 
                    <a href="./settings/administrators/${currentAdmin.id}">
                         ${currentAdmin.firstName} ${currentAdmin.lastName}
                    </a>.
                    `
                }
            }else if(event instanceof CustomerGroupChangeEvent){
                log.customerGroup= event.customGroup;
                log.change={customerIds: event.customers.map((item)=> item.id)}
                log.type= event.type;
                log.description= `
                    <a href="./settings/administrators/${currentAdmin.id}">
                        ${currentAdmin.firstName} ${currentAdmin.lastName}
                    </a>
                    ${event.type} 
                    customer${event.customers.length<=1?'':'s'}
                    ${event.customers.map((item)=> item.firstName + ' ' +item.lastName)}
                    ${event.type==='assigned'?'to':'from'}
                    <a href="./customer/groups;contents=${event.customGroup.id}">
                        ${event.customGroup.name}
                    </a>.
                    `
            }else{
                console.log('this shouldnt happen')
            }
            log.createdAt= event.createdAt;
            await repo.save(log);
        }else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this product need to be marked expired
            console.log(`all changes for customer createdAt ${event.createdAt} need to marked 
           activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext,filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        let allLogsSelectQueryBuilder= this.transactionalConnection.getRepository(ctx, CustomerRelatedActivityLogEntity)
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
                latest: false, //log.latestChange,
                dateTime: log.updatedAt
            })
        }
        return readableLogs;
    }

    async revertChanges(ctx:RequestContext, id:ID):Promise<Boolean>{
        throw new NotImplementedException();
    }

    onApplicationBootstrap() {
        if(this.processContext.isServer){
            this.eventBus.ofType(CustomerEvent).subscribe((async (event)=>{
                // console.log('event happened here')
                await this.registerLog(event);
            }));
            this.eventBus.ofType(CustomerGroupEntityEvent).subscribe((async (event)=>{
                // console.log('event happened here')
                await this.registerLog(event);
            }));
            this.eventBus.ofType(CustomerGroupChangeEvent).subscribe((async (event)=>{
                // console.log('event happened here')
                await this.registerLog(event);
            }));
        }
    }

}