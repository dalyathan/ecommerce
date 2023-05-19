import { ChannelAware, Customer, SoftDeletable, Translatable, CustomerGroup } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import {  Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity()
export class CustomerRelatedActivityLogEntity extends ActivityLogEntity<Customer> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<CustomerRelatedActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => Customer,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  entity: Customer;

  @ManyToOne(type => CustomerGroup,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  customerGroup: CustomerGroup;
}
