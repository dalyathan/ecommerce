
import { Entity, ManyToMany, Column, JoinTable, Generated,Index } from 'typeorm'
import { DeepPartial, EtechEntity, ProductVariant } from '@etech/core'

@Entity()
export class Quote extends EtechEntity{
 
    constructor(input?: DeepPartial<Quote>) {
        super(input);
      }
     
    @Column({default: false})
    isApproved: boolean;
    
    @Column()
    @Generated('uuid')
    uuid: string;

    @Column({nullable: true})
    adminName: string;
    
    @Column({default: 'no-code'})
    orderRef: string;

    @Column({default: false})
    isseen: boolean;

    @Column({length: 40})
    subject: string

    @Column({length: 40})
    fromEmail: string

    @Column({length: 40})
    @Index()
    userEmail: string

    @Column({length: 15})
    fromPhone: string


    @Column({length: 500})
    msg: string

    @Column({length: 30})
    location: string;

    @Column({length: 300, default:""})
    assetUrl: string;

    @Column({default: false})
    isSpecial: boolean;

    @ManyToMany(type=>ProductVariant, )
    @JoinTable({name: 'quote_product'})
    forProducts?: ProductVariant[]

    @Column({length: 900, nullable: true})
    productDescr?: string;

    @Column({default: ''})
    companyName?: string;
}
