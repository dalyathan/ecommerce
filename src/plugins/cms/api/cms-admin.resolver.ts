import {Args, Mutation, ResolveField, Resolver} from '@nestjs/graphql';
import {Allow, Ctx, RequestContext, Transaction} from '@etech/core';
import {CmsService} from "../service/cms.service";
import { MutationCreateCmsArgs} from "../generated-admin-types";
import { updateCmsPermissionDefinition } from '..';
@Resolver('Cms')
export class CmsAdminResolver {
    constructor(private cmsService: CmsService) {
    }
    @ResolveField()
    @Mutation()
    @Transaction()
    @Allow(updateCmsPermissionDefinition.Permission)
    createCms(@Ctx() ctx:RequestContext,@Args() args:MutationCreateCmsArgs){
        return this.cmsService.create(ctx,args.input)
    }
}
