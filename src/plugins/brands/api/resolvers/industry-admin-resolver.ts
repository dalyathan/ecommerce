import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext,Transaction} from '@etech/core';
import IndustryService from '../services/industry-service';
import { ProductIndustry } from '../entities/industry-entity';
import { IndustryInputType } from '../../generated-admin-types';
import {industryPermission} from '../../index';


@Resolver('Industry')
export default class IndustryAdminApiResolver {

  constructor(
  private industryService: IndustryService
  ) {} 

  @Mutation()
  @Transaction()
  @Allow(industryPermission.Create, Permission.CreateCatalog)
  async createIndustry(@Ctx() ctx: RequestContext, @Args('args') arg:IndustryInputType):Promise<ProductIndustry>{
    return await this.industryService.create(ctx, arg);
  }

  @Transaction()
  @Mutation()
  @Allow(industryPermission.Delete, Permission.DeleteCatalog)
  async deleteIndustry(@Ctx() ctx: RequestContext, @Args('id') id:ID):Promise<ID>{
    return this.industryService.delete(ctx, id);
  }

  @Transaction()
  @Mutation()
  @Allow(industryPermission.Update, Permission.UpdateCatalog)
  async editIndustry(@Ctx() ctx: RequestContext, @Args('args') arg:IndustryInputType):Promise<ProductIndustry>{
    return await this.industryService.edit(ctx, arg);
  }
}
