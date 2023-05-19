import { ChannelAware, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';
import PriceList from '../../../price-list/api/price-list.entity';

@Entity()
export class PriceListActivityLogEntity extends ActivityLogEntity<PriceList> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<PriceListActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => PriceList,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: PriceList;
}
