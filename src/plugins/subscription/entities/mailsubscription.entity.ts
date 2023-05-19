import { Entity, Column } from 'typeorm';
import { EtechEntity, DeepPartial } from '@etech/core';

@Entity()
export class MailSubscriptionEntity extends EtechEntity {

    constructor(input?: DeepPartial<MailSubscriptionEntity>) {
        super(input);
    }

    @Column({unique: true})
    email: string;
}
