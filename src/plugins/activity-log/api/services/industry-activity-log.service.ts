import { AdministratorService, EventBus, TransactionalConnection,Transaction, RequestContext, ID, ProcessContext, Administrator } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { default as dayjs } from 'dayjs';
import { ProductIndustryEvent } from '../../../../plugins/brands/events';
import { IndustryActivityLogEntity } from '../entities/industry-activity-log.entity';
@Injectable()
export class IndustryActivityLogService  extends ActivityLogService<ProductIndustryEvent> implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        let repo= this.transactionalConnection.getRepository(ctx, IndustryActivityLogEntity);
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
    async registerLog(event: ProductIndustryEvent){
        let repo= this.transactionalConnection.getRepository(event.ctx, IndustryActivityLogEntity);
        let log= new IndustryActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}}, 
                // select:['id', 'firstName', 'lastName','user']
            });
            log.admin= currentAdmin;
            if(event.type === 'created' || event.type === 'deleted'){
                log.change= {id: event.entity.id};
                if(event.type === 'created'){
                    log.description= `
                        <a href="./extensions/catalog/industries/${event.entity.id}">
                            ${event.entity.name}
                        </a> was
                        created by 
                        <a href="./settings/administrators/${currentAdmin.id}">
                            ${currentAdmin.firstName} ${currentAdmin.lastName}
                        </a>
                    `
                }
                else{
                    log.description= `${event.entity.name} was deleted by 
                        <a href="./extensions/catalog/industries/${currentAdmin.id}">
                            ${currentAdmin.firstName} ${currentAdmin.lastName}
                        </a>
                    `
                }
            }else{
                let recentChange=event.input;
                log.change= recentChange;
                log.description= `
                <a href="./extensions/catalog/industries/${event.entity.id}">
                    ${event.entity.name} 
                </a> was 
                updated by 
                <a href="./settings/administrators/${currentAdmin.id}">
                     ${currentAdmin.firstName} ${currentAdmin.lastName}
                </a>
                `
            }
            log.createdAt= event.createdAt;
            log.type= event.type;
            log.entity= event.entity;
            await repo.save(log);
        }else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this product need to be marked expired
            console.log(`all changes for industry createdAt ${event.createdAt} need to marked 
           activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext,filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        let allLogsSelectQueryBuilder= this.transactionalConnection.getRepository(ctx, IndustryActivityLogEntity)
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
            this.eventBus.ofType(ProductIndustryEvent).subscribe((async (event)=>{
                // console.log('event ProductIndustryEvent')
                await this.registerLog(event);
            }));
        }
    }

}