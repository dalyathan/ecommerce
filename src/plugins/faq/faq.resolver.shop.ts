//import { Query } from '@angular/core';
import { Ctx, RequestContext, } from '@etech/core';
import {Resolver, Query,Args} from '@nestjs/graphql';
import { FaqService } from './faq.service';

import {FaqType} from './ui/generated-admin-types';


@Resolver()
export class FaqShopResolver{

    constructor(private faqService: FaqService){

    }
    @Query()
    async getFaqs(@Ctx() ctx: RequestContext): Promise<FaqType[]>{
       return await this.faqService.getFaqs(ctx);
    }

    @Query()
    async getFilteredFaqs(@Ctx() ctx: RequestContext, @Args('tags') tags:string[]): Promise<FaqType[]>{
       return await this.faqService.getFaqs(ctx,tags);
    }

    @Query()
    async faqTags(@Ctx() ctx: RequestContext): Promise<String[]>{
       return await this.faqService.faqTags(ctx);
    }
}