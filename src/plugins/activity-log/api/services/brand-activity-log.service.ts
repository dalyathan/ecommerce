import { AdministratorService, EventBus, TransactionalConnection,Transaction, RequestContext, ID, ProcessContext, Administrator } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { default as dayjs } from 'dayjs';
import { ProductBrandEvent } from '../../../brands/events';
import { BrandActivityLogEntity } from '../entities/brand-activity-log.entity';
@Injectable()
export class BrandActivityLogService  extends ActivityLogService<ProductBrandEvent> implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        let repo= this.transactionalConnection.getRepository(ctx, BrandActivityLogEntity);
        await repo.softDelete(id);
        return true;
    }

    constructor(
        private eventBus: EventBus, 
        private processContext: ProcessContext,
        private transactionalConnection: TransactionalConnection){
        super();
    }

    @Transaction()
    async registerLog(event: ProductBrandEvent){
        let logRepo= this.transactionalConnection.getRepository(event.ctx, BrandActivityLogEntity);
        let log= new BrandActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            let currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}}, 
                // select:['id', 'firstName', 'lastName','user']
            });
            log.admin= currentAdmin;
            if(event.type === 'created' || event.type === 'deleted'){
                log.change= {id: event.entity.id};
                if(event.type === 'created'){
                    log.description= `
                        <a href="./extensions/catalog/brands/${event.entity.id}">
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
                        <a href="./extensions/catalog/brands/${currentAdmin.id}">
                            ${currentAdmin.firstName} ${currentAdmin.lastName}
                        </a>
                    `
                }
            }else{
                log.change= event.input;
                log.description= `
                    <a href="./extensions/catalog/brands/${event.entity.id}">
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
            await logRepo.save(log);
        }
        else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this product need to be marked expired
            console.log(`all changes for order brand ${event.createdAt} need to marked 
           activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext, filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        const allLogsSelectQueryBuilder= this.addFilterToQueryBuilder(this.transactionalConnection.getRepository(ctx, BrandActivityLogEntity)
        .createQueryBuilder('log')
        .innerJoin('log.admin','admin')
        .andWhere(`log.deletedAt IS NULL`), filter)
        .orderBy('log.createdAt','DESC');
        const allLogs= await allLogsSelectQueryBuilder.getMany();
        let readableLogs:ActivityLog[]=[]
        for(let log of allLogs){
            readableLogs.push({
                id: log.id,
                description: log.description,
                latest: false, //log.activityMadeTheCurrentContextualizedChange,
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
            this.eventBus.ofType(ProductBrandEvent).subscribe((async (event)=>{
                // console.log('event ProductBrandEvent ', event.type)
                await this.registerLog(event);
            }));
        }
    }

}