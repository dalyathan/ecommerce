import { Customer, DeepPartial, EtechEntity, Product } from '@etech/core'
import {Entity, ManyToMany, Column, BaseEntity, PrimaryColumn, JoinTable, CreateDateColumn } from 'typeorm'

@Entity()
export class InstantMessage extends EtechEntity{
    constructor(input?: DeepPartial<InstantMessage>) {
        super(input);
    }
    @Column({nullable: true})
    userEmail: string; //to this user or from this user

    @Column()
    msg: string

    @Column({default: false, nullable: false})
    isFromAdmin: boolean;

    @CreateDateColumn()
    sentAt: Date
    

    @Column({default: false})
    isSeen: boolean

    @Column({nullable: true})
    firstName: string

    @Column({nullable: true})
    lastName: string



}