

import { Asset, DeepPartial, EtechEntity } from '@etech/core';
import {Entity, Column, ManyToOne} from 'typeorm'

@Entity({name: 'company_info'})
export class CompanyInfo extends EtechEntity{

      constructor(input?: DeepPartial<CompanyInfo>) {
        super(input);
    }
	@Column({default: ''})
	commercial_bank: string;
	@Column({default: ''})
    or_bank : string;
    @Column({default: ''})
    ab_bank: string;
    @Column({default: ''})
    tele_birr: string;
    @Column({default: ''})
    dashen_bank: string;
    @Column({default: ''})
    berhan_bank: string;
    @Column({default: ''})
	location_text: string;
	
	@Column({default: ''})
	facebook_address: string;

	@Column({default: ''})
	twitter_address: string;

	@Column({default: ''})
	youtube_address: string;


	@Column({default: ''})
	telegram_address: string;

	@Column({default: ''})
	instagram_address: string;

	@Column({default: ''})
	linkdin_address: string;


	@Column({default: ''})
	phone_number: string;


	@Column({default: ''})
	email: string;


	@Column({default: '0'})
	longtude: string;

	@Column({default: '0'})
	latitude: string;

	@Column({default: ''})
	company_name: string

	@ManyToOne(type => Asset,  {
		eager: true,
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE'
	})
	icon: Asset;
} 