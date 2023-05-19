import { Channel, ChannelAware, Collection, Product, ProductVariant, Translatable, Translation } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import { EtechEntity } from '@etech/core';
import {Entity,ManyToMany,ManyToOne,JoinColumn,JoinTable } from 'typeorm';

@Entity()
export class BestSellerEntity extends EtechEntity implements ChannelAware, Translatable{
  constructor(input?: DeepPartial<BestSellerEntity>) {
    super(input);
  }

  @ManyToMany(type => Channel,{eager: true})
  @JoinTable()
  channels: Channel[];
  translations: Translation<BestSellerEntity>[];

  @ManyToOne(() => ProductVariant, {eager: true})
  @JoinColumn()
  variant: ProductVariant;

  @ManyToOne(() => Collection, {nullable: true})
  @JoinColumn()
  collection?: Collection;
}
