import { Asset, Channel, ChannelAware, Product, SoftDeletable, Translatable, Translation } from '@etech/core';
import { DeepPartial } from '@etech/common/lib/shared-types';
import { EtechEntity } from '@etech/core';
import { Column, Entity, ManyToOne, OneToMany,ManyToMany,JoinTable,DeleteDateColumn } from 'typeorm';

@Entity()
export class ProductBrand extends EtechEntity implements ChannelAware, SoftDeletable, Translatable{
  constructor(input?: DeepPartial<ProductBrand>) {
    super(input);
  }
  translations: Translation<EtechEntity>[];

  @DeleteDateColumn({ type: Date, nullable: true })
    deletedAt: Date | null;

  @Column({length: 100})
  name: string;
  
  @Column({length: 10000})
  description:  string;

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
  
  @OneToMany(() => Product, 
    (product) => (product.customFields as any).brand, 
    {eager: true, cascade: false, onDelete: 'SET NULL', onUpdate:'CASCADE'})
  @JoinTable()
  products: Product[];
}
