import { Column, Entity, Index } from 'typeorm';
import { DeepPartial, EtechEntity } from '@etech/core';

@Entity('invoice_config')
export class InvoiceConfigEntity extends EtechEntity {
  constructor(input?: DeepPartial<InvoiceConfigEntity>) {
    super(input);
  }

  @Column()
  @Index()
  channelId!: string;
  @Column({ default: false })
  enabled: boolean = false;
  @Column({ type: 'text', nullable: true })
  templateString?: string | null;
}
