//import { Query } from '@angular/core';
import {Resolver, Query, Mutation, Subscription, Args} from '@nestjs/graphql';
import { Testimonial } from './testimonials.model';
import { TestimonialService } from './testimonials.service';
import { Asset, AssetService, Ctx, ID, RequestContext, Transaction, TransactionalConnection } from "@etech/core";



@Resolver()
export class TestimonialResolver{

    constructor(private tSvc: TestimonialService, private transactionalConnection: TransactionalConnection){

    }
    @Query()
    async getTestimonials(@Ctx() ctx: RequestContext): Promise<Testimonial[]>{
       return await this.tSvc.getAllTestimonials(ctx);
    }

   async getImgFromId(ctx: RequestContext, id: string): Promise<string>{
    const assetRepo= this.transactionalConnection.getRepository(ctx, Asset);
    const img= (await assetRepo.findOne({where:{id}, 
      // select:['source','id']
    }));
    return img ? img.source : '';
   }
   @Mutation()
   @Transaction()
   async setTestimonialPicture(@Ctx() ctx: RequestContext,@Args('id') id: string, 
                                @Args('pic_loc') pic_loc: string): 
   Promise<Testimonial[]>{
     return await this.tSvc.setTestimonialPicture(ctx,id, await this.getImgFromId(ctx, pic_loc));
   }
   
    @Mutation()
    @Transaction()
    async createTestimonial(
      @Ctx() ctx: RequestContext,
      @Args('name') name: string, @Args('position') pos: string,
                            @Args('msg') msg: string
    ): Promise<Testimonial>{
       return await this.tSvc.createTesimonial(ctx,name, pos, msg)

    }

    @Mutation()
    @Transaction()
    async removeTestimonial(@Ctx() ctx: RequestContext,@Args('id') id: string): Promise<Testimonial[]>{
      return await this.tSvc.removeTestimonial(ctx,id);
    }

}
