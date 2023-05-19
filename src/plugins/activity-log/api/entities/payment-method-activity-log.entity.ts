import { ChannelAware, PaymentMethod, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity()
export class PaymentMethodActivityLogEntity extends ActivityLogEntity<PaymentMethod> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<PaymentMethodActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => PaymentMethod,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  entity: PaymentMethod;
}
