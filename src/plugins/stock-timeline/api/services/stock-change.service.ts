import { AdministratorService, ConfigService, EventBus, ID, OrderItem, ProcessContext, ProductVariant, ProductVariantEvent, StockMovementEvent } from '@etech/core';
import {Injectable,OnApplicationBootstrap} from '@nestjs/common';
import { StockChangeLog } from '../stock-change-log.entity';
import {getRepository} from 'typeorm';
import { StockAdjustment } from '@etech/core/dist/entity/stock-movement/stock-adjustment.entity';

@Injectable()
export class StockChangeLogService implements OnApplicationBootstrap{
    constructor(private eventBus: EventBus, 
        private adminService: AdministratorService,
        private processContext: ProcessContext){

    }
    onApplicationBootstrap() {
        if(this.processContext.isServer){
            this.eventBus.ofType(StockMovementEvent).subscribe(async(evt)=>{
                const stockChangeLogRepo= getRepository(StockChangeLog);
                const productVariantRepo= getRepository(ProductVariant);
                const logs:StockChangeLog[]=[];
                const admin = await this.adminService.findOneByUserId(evt.ctx, evt.ctx.activeUserId);
                for(let movt of evt.stockMovements){
                    if(movt instanceof StockAdjustment){
                        const variant= await productVariantRepo.createQueryBuilder('variant')
                        .leftJoinAndSelect('variant.customFields.stockTimeline','stockTimeline')
                        .where('variant.id = :id',{id:movt.productVariant.id}).getOne();
                        const log= new StockChangeLog();
                        log.administrator=admin;
                        log.stockChange=movt.quantity;
                        log.item=movt.productVariant;
                        log.stockOnHand=variant.stockOnHand;
                        await productVariantRepo.save({
                            id: variant.id,
                            customFields:{
                                ...variant.customFields,
                                stockTimeline: [...(variant.customFields.stockTimeline),await stockChangeLogRepo.save(log) ]}
                        })
                        return;
                    }
                }
            });
        }
    }
}