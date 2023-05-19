import { DeepPartial, EtechEntity, Tag, Taggable } from '@etech/core';
import {Entity, Column, CreateDateColumn,ManyToMany,JoinTable} from 'typeorm'

@Entity({name: 'Faq'})
export class Faq extends EtechEntity implements Taggable{
    constructor(input?: DeepPartial<Faq>) {
        super(input);
    }

    @ManyToMany(type => Tag)
    @JoinTable()
    tags: Tag[];

    @Column("text")
    question: string;

    @Column("text")
    answer: string;

    @Column({name: 'is_disabled', default: false})
    isEnabled: boolean;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date
}