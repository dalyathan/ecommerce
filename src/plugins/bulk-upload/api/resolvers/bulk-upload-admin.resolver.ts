import { Allow, Ctx, RequestContext, Transaction } from '@etech/core';
import { Args, Mutation, Resolver, } from '@nestjs/graphql';
import { createBulkUploadPermissionDefinition } from '../..';
import {ActualProduct} from '../../ui/generated-admin-types';
import { BulkUploadInitService } from '../services/bulk-upload-init.service';
@Resolver()
export class BulkUploadAdminResolver{
  constructor(private service: BulkUploadInitService){

  }
  
  @Mutation()
  @Transaction()
  @Allow(createBulkUploadPermissionDefinition.Permission)
  async uploadBulkData(@Ctx() ctx: RequestContext, @Args('input') input:ActualProduct[]):Promise<String>{
    return this.service.init(ctx,input);
  }   
}