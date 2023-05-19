import { Administrator, DeepPartial, EtechEntity, ProductVariant } from '@etech/core';
import {Entity, ManyToOne,JoinTable,Column} from 'typeorm';

@Entity()
export class StockChangeLog extends EtechEntity{

    constructor(input?: DeepPartial<StockChangeLog>) {
        super(input);
    }
    
    @ManyToOne(() => ProductVariant, item=>item.customFields.stockTimeline, {eager: true})
    item: ProductVariant

    @ManyToOne(() => Administrator,{eager: true})
    administrator: Administrator

    @Column()
    stockOnHand:number;

    @Column()
    stockChange:number;


}