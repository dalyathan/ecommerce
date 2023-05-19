import { ChannelAware, Product, ShippingMethod, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity()
export class ShippingMethodActivityLogEntity extends ActivityLogEntity<ShippingMethod> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<ShippingMethodActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => ShippingMethod,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: ShippingMethod;
}
