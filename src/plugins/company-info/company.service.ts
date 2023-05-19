



import { AssetService, Ctx, ID, RequestContext, TransactionalConnection } from "@etech/core";
import { Injectable } from "@nestjs/common";
// import {getRepository} from 'typeorm'
import {Mutation} from '@nestjs/graphql';

import {CompanyInfo} from './company.model'

@Injectable()
export class CompanyService
{
        constructor(private assetService: AssetService, private connection:TransactionalConnection){

        }
	async  getComapnyInfo(ctx: RequestContext) : Promise<CompanyInfo>{
        const repo = await this.connection.getRepository(ctx, CompanyInfo)
        const infos = await repo.find();
        if(infos.length) return infos[0]

        else {
           const info = new CompanyInfo()
           await repo.save(info)

           return info
        }
	}

	async  setCompanyInfo(
                ctx: RequestContext,
	        company_name: string,

            facebook_address: string,

            linkdin_address: string,

            twitter_address: string,

            phone_number: string,

            email: string,

            youtube_address: string,

            telegram_address: string,

            instagram_address: string,

            longitude: string,

            latitude: string,
            icon_id: ID,
            location_text: string,
            commercial_bank : string,
            or_bank : string,
            ab_bank : string,
            tele_birr : string,
            dashen_bank : string,
            berhan_bank: string,
         
	): Promise<CompanyInfo | null>{
        const repo =  this.connection.getRepository(ctx, CompanyInfo)

	const info = await this.getComapnyInfo(ctx)
         if(or_bank) info.or_bank = or_bank
         if(ab_bank) info.ab_bank = ab_bank
         if(commercial_bank) info.commercial_bank = commercial_bank
         if(berhan_bank) info.berhan_bank = berhan_bank
         if(dashen_bank) info.dashen_bank = dashen_bank
         if(tele_birr) info.tele_birr = tele_birr




          if(company_name) info.company_name = company_name
          if(facebook_address) info.facebook_address = facebook_address
          if(twitter_address) info.twitter_address = twitter_address
          if(linkdin_address) info.linkdin_address=linkdin_address
          if(phone_number) info.phone_number = phone_number
          if(email) info.email = email
          if(youtube_address) info.youtube_address = youtube_address
          if(telegram_address) info.telegram_address = telegram_address
          if(instagram_address) info.instagram_address = instagram_address
          if(longitude) info.longtude = longitude
          if(latitude) info.latitude = latitude
          if(facebook_address) info.facebook_address = facebook_address
          if(icon_id) info.icon= await this.assetService.findOne(ctx, icon_id)
        if(location_text) info.location_text = location_text;
           await repo.save(info)
          return info
	}

}
