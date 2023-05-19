import {Args, Query, ResolveField, Resolver} from '@nestjs/graphql';
import {Ctx, not, RequestContext} from '@etech/core';
import {CmsService} from "../service/cms.service";
import {Type} from "../generated-shop-types";
import {CmsEntity} from "../entities/cms.entity";
@Resolver('Cms')
export class CmsEntityResolver{
    constructor(private cmsService: CmsService) {}
    @ResolveField()
    @Query()
    async getCms(@Ctx() ctx: RequestContext, @Args() args: [Type]): Promise<CmsEntity[]> {
        let result: CmsEntity[] = []
        // @ts-ignore
        
        let types=args.type
        // console.log({args})
        for (let i = 0; i < types?.length; i++) {
           await this.cmsService.findOne(ctx, types[i]).then((results)=>{
               result.push(results)
           })
        }
        return result
    }
}
