import { Args, Mutation, Resolver , Query} from '@nestjs/graphql';
import {
    Ctx,
    RequestContext,
    Transaction,
} from '@etech/core';
import { QuoteService } from './qoute_service';
import { Quote } from './quote_entity';
import {QuoteInputType} from '../ui/generated-admin-types';

@Resolver()
export class QuoteShopResolver {
    
    constructor(private quoteService: QuoteService,){}

    @Query()
    async getQueryOf(@Ctx() ctx: RequestContext,@Args('email') email: string): Promise<Quote[]>{
        return await this.quoteService.getQuotesOf(ctx,email);
    }

    @Mutation()
    @Transaction()
    async writeQuote(@Ctx() ctx: RequestContext, @Args('args') input:QuoteInputType): Promise<Quote>{
        return await this.quoteService
        .addQuote(ctx, input);
    }
}