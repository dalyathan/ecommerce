import { Entity, Column } from 'typeorm';
import { EtechEntity, DeepPartial } from '@etech/core';

@Entity()
export class PhoneSubscriptionEntity extends EtechEntity {

    constructor(input?: DeepPartial<PhoneSubscriptionEntity>) {
        super(input);
    }

    @Column({unique: true})
    phone: string;
}
