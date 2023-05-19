import { ChannelAware, Product, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';
import { ProductBrand } from '../../../brands/api/entities/brand-entity';

@Entity()
export class BrandActivityLogEntity extends ActivityLogEntity<ProductBrand> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<BrandActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => ProductBrand,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: ProductBrand;
}
