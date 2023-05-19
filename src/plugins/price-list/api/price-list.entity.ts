import { EtechEntity, ChannelAware, SoftDeletable, Translatable, Channel, Translation, CustomerGroup, 
    ProductVariant, HasCustomFields, CustomFieldsObject } from "@etech/core";
import {Entity,ManyToMany,JoinTable, OneToOne, JoinColumn, Column, ManyToOne} from 'typeorm';

@Entity()
export default class PriceList extends EtechEntity implements ChannelAware, SoftDeletable, Translatable, HasCustomFields{
    customFields: CustomFieldsObject;
    deletedAt: Date;
    constructor(){
        super();
    }
    
    translations: Translation<EtechEntity>[];

    @ManyToMany(type => Channel)
    @JoinTable()
    channels: Channel[]

    @ManyToOne(()=> CustomerGroup, {eager: true, onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    @JoinColumn()
    customerGroup: CustomerGroup

    @Column()
    percentDiscount:string

    @Column({default:false})
    isPriceListStoreWide:boolean

    @Column()
    title:string



    @Column({default: true})
    enabled:boolean

    @ManyToMany(()=> ProductVariant, {onDelete: 'CASCADE', onUpdate: 'CASCADE', cascade: true})
    @JoinTable()
    productVariants: ProductVariant[]

}