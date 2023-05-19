import { Ctx, RequestContext } from '@etech/core';
import { Resolver,Query } from '@nestjs/graphql';
@Resolver()
export class AdminApiResolver{

   async aggregate(@Ctx() ctx: RequestContext) {
    
   }

}