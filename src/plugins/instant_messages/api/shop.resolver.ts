import { Args, Mutation, Resolver , Query} from '@nestjs/graphql';
import { InstantMessage } from './instant-message.entity';
import { InstantMessageService } from './instant-message.service';
import { Ctx, RequestContext } from '@etech/core';
import { Success } from '@etech/admin-ui/package/core';

@Resolver()
export class ShopApiResolver{

     constructor(private instantMessageService: InstantMessageService){}
     @Mutation()
     async writeInstantMessage(@Args('userEmail') userEmail: string, 
     @Args('msg') msg: string, @Args('isFromAdmin') isFromAdmin: boolean = false,
           @Args('firstName') firstName = '', @Args('lastName') lastName: string = '', @Ctx() ctx: RequestContext,
     ): 
     Promise<InstantMessage>{
              return this.instantMessageService.writeInstantMessage(msg, userEmail, isFromAdmin, firstName, lastName, ctx);
     }
     @Query()
     async getUserInstantMessage(@Args('userEmail') userEmail: string, @Ctx() ctx: RequestContext,): Promise<InstantMessage[]> {
        // console.log(`Getting instant messages of ${userEmail}`)
        return this.instantMessageService.getUserInstantMessages(
            userEmail,ctx
        );
     }
     
     @Mutation()
     async makeSeenByUser(@Args('ids') ids:string[], @Ctx() ctx: RequestContext,): Promise<Success>{
         return this.instantMessageService.makeSeenByUser(ids, ctx);
     }
}