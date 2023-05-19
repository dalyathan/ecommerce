import { AdministratorService, EventBus, ProductEvent, TransactionalConnection,Transaction, Ctx, RequestContext, ID, ProductService, Product, UserService, ProcessContext, CollectionEvent, CollectionModificationEvent, ProductVariantService, Administrator } from '@etech/core';
import {
    Injectable, OnApplicationBootstrap, NotImplementedException
  } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import {ActivityLog, ActivityLogFilter} from '../../ui/generated-admin-types';
import { CollectionActivityLogEntity } from '../entities/collection-activity-log.entity';
import { default as dayjs } from 'dayjs';
@Injectable()
export class CollectionActivityLogService  extends ActivityLogService<CollectionEvent | CollectionModificationEvent> implements OnApplicationBootstrap{

    async deleteActivityLog(ctx: RequestContext, id: ID): Promise<Boolean> {
        let repo= this.transactionalConnection.getRepository(ctx, CollectionActivityLogEntity);
        await repo.softDelete(id);
        return true;
    }

    constructor(
        private eventBus: EventBus, 
        private processContext: ProcessContext,
        private productVariantService: ProductVariantService,
        private transactionalConnection: TransactionalConnection){
        super();
    }

    @Transaction()
    async registerLog(event: CollectionEvent | CollectionModificationEvent){
        let repo= this.transactionalConnection.getRepository(event.ctx, CollectionActivityLogEntity);
        let log= new CollectionActivityLogEntity();
        if(event.ctx.apiType === 'admin'){
            const adminRepo= this.transactionalConnection.getRepository(event.ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: event.ctx.activeUserId}},
                //  select:['id', 'firstName', 'lastName','user']
                });
            log.admin= currentAdmin;
            if(event instanceof CollectionEvent){
                log.type= event.type;
                if(event.type === 'created' || event.type === 'deleted'){
                    log.change= {id: event.entity.id};
                    if(event.type === 'created'){
                        log.entity= event.entity;
                        log.description= `
                            <a href="./catalog/collections/${event.entity.id}">
                                ${event.entity.translations[0].name}
                            </a>
                            was created by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>
                        `
                    }
                    else{
                        log.description= `${event.entity.translations[0].name} was deleted by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>
                        `
                    }
                }else{
                    let recentChange=event.input;
                    log.change= recentChange;
                    log.entity= event.entity;
                    log.description= `
                            <a href="./catalog/collections/${event.entity.id}">
                                ${event.entity.translations[0].name}
                            </a>
                            was updated by 
                            <a href="./settings/administrators/${currentAdmin.id}">
                                ${currentAdmin.firstName} ${currentAdmin.lastName}
                            </a>
                        `
                }
            }else{
                log.type= 'collection_modification';
                log.entity= event.collection;
                log.variants= await this.productVariantService.findByIds(event.ctx, event.productVariantIds)
                log.change= {productVariantIds: event.productVariantIds}
                log.description= `
                    <a href="./catalog/collections/${event.collection.id}">
                        ${event.collection.translations[0].name}
                    </a>
                    was updated by 
                    <a href="./settings/administrators/${currentAdmin.id}">
                        ${currentAdmin.firstName} ${currentAdmin.lastName}
                    </a>
                `
            }
            // log.type= event.type;
            log.createdAt= event.createdAt;
            // log.entity= event.entity;
            await repo.save(log);
            return;
        }else if(event.ctx.apiType === 'shop'){
            //all the changes regarding this collection need to be marked expired
            console.log(`all changes for collection createdAt ${event.createdAt} need to marked 
           activityMadeTheCurrentContextualizedChange=false because change came from shop-api`)
        }else{
            console.log(`unidentified api`);
        }
    }

    async activityLogs(ctx: RequestContext, filter?: ActivityLogFilter):Promise<ActivityLog[]>{
        let allLogsSelectQueryBuilder= this.transactionalConnection.getRepository(ctx, CollectionActivityLogEntity)
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
            this.eventBus.ofType(CollectionEvent).subscribe((async (event)=>{
                // console.log('CollectionEvent happened here')
                await this.registerLog(event);
            }));
            this.eventBus.ofType(CollectionModificationEvent).subscribe((async (event)=>{
                // console.log(`CollectionModificationEvent happened here`)
                await this.registerLog(event);
            }));
        }
    }

}