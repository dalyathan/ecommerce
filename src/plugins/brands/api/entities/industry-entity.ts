import { Asset, Channel, ChannelAware, SoftDeletable } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import { EtechEntity } from '@etech/core';
import { Column, Entity, ManyToOne, DeleteDateColumn,ManyToMany,JoinTable } from 'typeorm';

@Entity()
export class ProductIndustry extends EtechEntity implements ChannelAware, SoftDeletable{
  constructor(input?: DeepPartial<ProductIndustry>) {
    super(input);
  }

  @DeleteDateColumn({ type: Date, nullable: true })
  deletedAt: Date | null;

  @Column({length: 100})
  name: String;
  
  @Column({length: 10000})
  description:  String;

  @ManyToOne(type => Asset,  {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  icon: Asset;

  @ManyToMany(type => Channel)
  @JoinTable()
  channels: Channel[];
}
