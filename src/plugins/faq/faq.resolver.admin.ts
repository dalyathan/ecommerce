import { Allow, Ctx, RequestContext, Transaction } from '@etech/core';
import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import { createFAQsPermissionDefinition, deleteFAQsPermissionDefinition, updateFAQsPermissionDefinition } from '.';
import { Faq } from './faq.model';
import { FaqService } from './faq.service';

import {FaqInputType,FaqType} from './ui/generated-admin-types';


@Resolver()
export class FaqAdminResolver{

    constructor(private faqService: FaqService){

    }
    @Query()
    async getFaqs(@Ctx() ctx: RequestContext): Promise<FaqType[]>{
       return await this.faqService.getFaqs(ctx);
    }



    @Mutation()
    @Transaction()
    @Allow(createFAQsPermissionDefinition.Permission)
    async createFaq(@Ctx() ctx: RequestContext,@Args('faq') faqInput: FaqInputType): Promise<FaqType>{
       return await this.faqService.createFaq(ctx, faqInput)
    }

    @Mutation()
    @Transaction()
    @Allow(deleteFAQsPermissionDefinition.Permission)
    async deleteFaq(@Ctx() ctx: RequestContext,@Args('id') id):  Promise<FaqType>{
        return await this.faqService.deleteFaq(ctx,id);
    }

    @Mutation()
    @Transaction()
    @Allow(updateFAQsPermissionDefinition.Permission)
    async editFaq(@Ctx() ctx: RequestContext,@Args('id') id, @Args("newFaq") newFaq:FaqInputType):  Promise<FaqType>{
        return await this.faqService.updateFaq(ctx,id, newFaq);
    }

    @Mutation()
    @Transaction()
    @Allow(updateFAQsPermissionDefinition.Permission)
    async enableFaq(@Ctx() ctx: RequestContext,@Args('id') id):  Promise<FaqType>{
       return await this.faqService.enableFaq(ctx,id);
    }

    @Mutation()
    @Transaction()
    @Allow(updateFAQsPermissionDefinition.Permission)
    async disableFaq(@Ctx() ctx: RequestContext, @Args('id') id):  Promise<FaqType>{
        return await this.faqService.disableFaq(ctx, id);
     }
}