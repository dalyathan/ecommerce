import { Column, Entity, Unique, Index } from 'typeorm';
import { DeepPartial, EtechEntity } from '@etech/core';

@Entity('invoice')
@Unique(['channelId', 'invoiceNumber'])
export class InvoiceEntity extends EtechEntity {
  constructor(input?: DeepPartial<InvoiceEntity>) {
    super(input);
  }

  @Column()
  @Index()
  channelId!: string;
  @Column({ nullable: false })
  orderCode!: string;
  @Column({ nullable: false })
  orderId!: string;
  @Column({ nullable: false })
  @Index()
  customerEmail!: string;
  @Column({ nullable: false, type: 'int' })
  invoiceNumber!: number;
  @Column({ nullable: false })
  storageReference!: string;
}
