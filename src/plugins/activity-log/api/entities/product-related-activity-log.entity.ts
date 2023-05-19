import { ChannelAware, Product, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity()
export class ProductRelatedActivityLogEntity extends ActivityLogEntity<Product> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<ProductRelatedActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => Product,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: Product;
}
