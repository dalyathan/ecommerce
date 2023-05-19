import { ChannelAware, Fulfillment, Order, Refund, SoftDeletable, Translatable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import { Entity, ManyToOne } from 'typeorm';
import { ActivityLogEntity } from './activity-log.entity';

@Entity()
export class OrderRelatedActivityLogEntity extends ActivityLogEntity<Order> implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<OrderRelatedActivityLogEntity>) {
    super(input);
  }

  @ManyToOne(type => Order,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  entity: Order;
  
  @ManyToOne(type => Refund,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  refund: Refund;

  @ManyToOne(type => Fulfillment,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  fulfillment: Fulfillment;
}
