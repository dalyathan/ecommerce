import { EventBus, ProcessContext,Product,ProductEvent, ProductVariant, ProductVariantService } from '@etech/core';
import {
    Injectable,
    OnApplicationBootstrap
  } from '@nestjs/common';
import { GlobalFlag } from '../../generated-shop-types';
import {getRepository} from 'typeorm';
@Injectable()
export class OrderBasedItemStockTrackingUpdater  implements OnApplicationBootstrap{
    constructor(private processCtx: ProcessContext,
        private eventBus: EventBus){

    }
    onApplicationBootstrap() {
        if(this.processCtx.isServer){
            this.eventBus.ofType(ProductEvent).subscribe(
                async (event)=>{
                   if(event.entity.customFields.is_order_based){
                    const toBeUpdated=[];
                    const pvRepo= getRepository(ProductVariant);
                    const variants= await pvRepo.
                    createQueryBuilder('pv').where(`pv.productId = ${event.entity.id}`).getMany();
                    for(let v of variants){
                        if(v.trackInventory === GlobalFlag.TRUE || v.trackInventory === GlobalFlag.INHERIT){
                            v.trackInventory= GlobalFlag.FALSE;
                            toBeUpdated.push(v);
                        }
                    }
                    await pvRepo.save(toBeUpdated);
                   }
                }
            );
        }
    }

}