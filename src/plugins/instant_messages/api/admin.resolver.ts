import { Args, Mutation, Resolver , Query} from '@nestjs/graphql';
import { InstantMessage } from './instant-message.entity';
import { InstantMessageService } from './instant-message.service';
import { Ctx, RequestContext } from '@etech/core';
import { Success } from '@etech/admin-ui/package/core';

@Resolver()
export class AdminApiResolver{

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
     async getAllInstantMessages(@Ctx() ctx: RequestContext,): Promise<InstantMessage[]>{
        return this.instantMessageService.getAllInstantMessages(ctx);
     }
     
     @Mutation()
     async makeSeenByAdmin(@Args('ids') ids:string[], @Ctx() ctx: RequestContext,): Promise<Success>{
         return this.instantMessageService.makeSeenByAdmin(ids, ctx);
     }
}