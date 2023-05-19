import { ChannelAware, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';
import { ProductIndustry } from '../../../brands/api/entities/industry-entity';

@Entity()
export class IndustryActivityLogEntity extends ActivityLogEntity<ProductIndustry> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<IndustryActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => ProductIndustry,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: ProductIndustry;
}
