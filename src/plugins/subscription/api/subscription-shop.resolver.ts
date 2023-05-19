import { Args, Parent, Query, Resolver, Mutation } from '@nestjs/graphql';
import { MailSubscriptionService } from '../service/mailsubscription.service';
import { PhoneSubscriptionService } from '../service/phonesubscription.service';
import { RequestContext, Ctx, Transaction } from '@etech/core';

@Resolver()
export class SubscriptionShopResolver {
    constructor(private mailsubscriptionService: MailSubscriptionService, private phonesubscriptionService: PhoneSubscriptionService) {
    }

	@Mutation()
	@Transaction()
	addSubscriptionEmail(@Ctx() ctx: RequestContext, @Args() args: any){
	   const {input} = args;
	   return this.mailsubscriptionService.addMail(ctx,input);
	}
	
	@Mutation()
	@Transaction()
	addSubscriptionPhone(@Ctx() ctx: RequestContext, @Args() args: any){
	   const {input} = args;
	   return this.phonesubscriptionService.addPhone(ctx,input);
	}
	
}
