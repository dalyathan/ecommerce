import { Asset } from '@etech/common/lib/generated-types';
import { Args, Mutation, Resolver , Query} from '@nestjs/graphql';
import {
    Allow,
    Ctx,
    Permission,
    RequestContext,
    Transaction,
} from '@etech/core';
import { QuoteService } from './qoute_service';
import { Quote } from './quote_entity';
import {deleteQuotePermissionDefinition,updateQuotesPermissionDefinition} from './index';
import { QuoteFilter } from '../ui/generated-admin-types';


@Resolver()
export class QuoteAdminResolver {
    
    constructor(private quoteService: QuoteService,){}


    @Query()
    @Allow(Permission.Owner)
    async getQuotesForCustomer(@Ctx() ctx: RequestContext,@Args('email') email: string): Promise<String[]>{
        return await this.quoteService
        .customerQuotes(ctx, email);
    }

    @Query()
    async getQuote(@Ctx() ctx: RequestContext, @Args('id') id: string) : Promise<Quote | null>{
       return await this.quoteService.getQuote(ctx, id);
    }

    @Query()
    async getAllQuotes(@Ctx() ctx: RequestContext,@Args('filter') filter: QuoteFilter): Promise<Quote[]>{
        return await this.quoteService.myQuotes(ctx, filter)
    }
    
    @Query()
    async getQuoteResponseLink(
        @Ctx() ctx,
        @Args('id') id: string
    ): Promise<string>{
        return await this.quoteService.downloadResponsePdf(ctx, id);
    }
    
    @Mutation()
    @Transaction()
    @Allow(deleteQuotePermissionDefinition.Permission)
    async deleteQuote(@Ctx() ctx: RequestContext, @Args('id') id: string): Promise<Quote>{
        return await this.quoteService.deleteQuote(ctx,id );
        
     }

    @Mutation()
    @Transaction()
    @Allow(updateQuotesPermissionDefinition.Permission)
    async makeQuoteSeen(@Ctx() ctx: RequestContext, @Args('id') id: string): Promise<Quote>{
         return await this.quoteService.seen(ctx,id );
         
    }

    @Mutation()
    @Transaction()
    @Allow(updateQuotesPermissionDefinition.Permission)
    async approveQuote(@Ctx() ctx:RequestContext, 
      @Args('id') id: string): Promise<Quote>{
          return await this.quoteService.approve(ctx, id);
    }
    
    @Mutation()
    @Transaction()
    @Allow(updateQuotesPermissionDefinition.Permission)
    async regenerateQuote(@Ctx() ctx:RequestContext, 
      @Args('id') id: string): Promise<Quote>{
          return await this.quoteService.regenerateQuote(ctx, id);
    }
}