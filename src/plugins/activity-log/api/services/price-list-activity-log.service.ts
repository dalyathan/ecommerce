import { AdministratorService, EventBus, TransactionalConnection,Transaction, RequestContext, ID, ProcessContext, Administrator } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { default as dayjs } from 'dayjs';
import { PriceListEvent } from '../../../price-list/events';
import { PriceListActivityLogEntity } from '../entities/price-list-activity-log.entity';
@Injectable()
export class PriceListActivityLogService  extends ActivityLogService<PriceListEvent> implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        const repo= this.transactionalConnection.getRepository(ctx, PriceListActivityLogEntity);
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
    async registerLog(event: PriceListEvent){
        const repo= this.transactionalConnection.getRepository(event.ctx, PriceListActivityLogEntity);
        const log= new PriceListActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}}, 
                // select:['id', 'firstName', 'lastName','user']
            });
            log.admin= currentAdmin;
            if(event.type === 'created'){
                log.change= {id: event.entity.id};
                if(event.type === 'created'){
                    log.description= `
                        <a href="./extensions/customers/price-lists">
                            ${event.entity.title}
                        </a> was
                        created by 
                        <a href="./settings/administrators/${currentAdmin.id}">
                            ${currentAdmin.firstName} ${currentAdmin.lastName}
                        </a>
                    `
                }
            }else{
                log.change= event.input;
                log.description= `
                    <a href="./extensions/customers/price-lists">
                        ${event.entity.title} 
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
        }
        else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this product need to be marked expired
            console.log(`all changes for price list ${event.createdAt} need to marked 
           activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext,filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        let allLogsSelectQueryBuilder= this.transactionalConnection.getRepository(ctx, PriceListActivityLogEntity)
        .createQueryBuilder('log')
        .innerJoin('log.admin','admin')
        .andWhere(`log.deletedAt IS NULL`)
        .orderBy('log.createdAt','DESC');
        allLogsSelectQueryBuilder= this.addFilterToQueryBuilder(allLogsSelectQueryBuilder, filter);
        const allLogs= await allLogsSelectQueryBuilder.getMany();
        const readableLogs:ActivityLog[]=[]
        for(const log of allLogs){
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
            this.eventBus.ofType(PriceListEvent).subscribe((async (event)=>{
                // console.log('event ProductBrandEvent ', event.type)
                await this.registerLog(event);
            }));
        }
    }

}