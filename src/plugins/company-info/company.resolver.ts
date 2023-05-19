//import { Query } from '@angular/core';
import {Resolver, Query, Mutation, Subscription, Args} from '@nestjs/graphql';

import {CompanyService} from './company.service';
import {CompanyInfo} from './company.model'
import { Ctx, ID, RequestContext, Transaction } from '@etech/core';


@Resolver()
export class CompanyResolver{

    constructor(private companyService: CompanyService){}
     
     @Mutation()
     @Transaction()    
     async  setCompanyInfo(
              @Ctx() ctx: RequestContext,
           @Args('company_name') company_name: string,
 
           @Args('facebook_address') facebook_address: string,

            @Args('linkdin_address') linkdin_address: string,

            @Args('twitter_address') twitter_address: string,
            @Args('phone_number') phone_number: string,

            @Args('email') email: string,

            @Args('youtube_address') youtube_address: string,

            @Args('telegram_address') telegram_address: string,

            @Args('instagram_address') instagram_address: string,

            @Args('longitude') longitude: number,

            @Args('latitude') latitude: number,
            @Args('icon_id') icon_id: ID,

            @Args('location_text') location_text,

            @Args('commercial_bank')  commercial_bank ,
            @Args('or_bank')  or_bank ,
            @Args('ab_bank')  ab_bank ,
            @Args('tele_birr')   tele_birr ,
            @Args('dashen_bank')  dashen_bank ,
            @Args('berhan_bank') berhan_bank,
         
 
          ): Promise<CompanyInfo>
          {
             return await this.companyService.setCompanyInfo(
              ctx,
              company_name,

                   facebook_address,

            linkdin_address,

            twitter_address,

            phone_number,

            email,

            youtube_address,

            telegram_address,

            instagram_address,

            `${longitude}`,

            `${latitude}`,
            icon_id,
            location_text,
            commercial_bank,
            or_bank,
            ab_bank,
            tele_birr,
            dashen_bank,
            berhan_bank
         
	)
          }
 
     
         @Query()
         async getCompanyInfos(@Ctx() ctx: RequestContext): Promise<CompanyInfo>{
                return await this.companyService.getComapnyInfo(ctx)
         }
}
