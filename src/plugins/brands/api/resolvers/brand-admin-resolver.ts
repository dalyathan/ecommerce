import { Args, Mutation, Resolver, } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext,Transaction} from '@etech/core';
import BrandService from '../services/brand-service';
import { ProductBrand } from '../entities/brand-entity';
import {BrandInputType} from '../../ui/generated-admin-types';
import { brandsPermission } from '../..';


@Resolver('Brand')
export default class BrandAdminApiResolver {

  constructor(
    private brandService: BrandService
    ) {}

  @Mutation()
  @Transaction()
  @Allow(brandsPermission.Create,Permission.CreateCatalog)
  async createBrand(@Ctx() ctx: RequestContext, @Args('args') arg:BrandInputType):Promise<ProductBrand>{
    return await this.brandService.create(ctx, arg);
  }

  @Mutation()
  @Transaction()
  @Allow(brandsPermission.Delete,Permission.DeleteCatalog)
  async deleteBrand(@Ctx() ctx: RequestContext, @Args('id') id:ID):Promise<ID>{
    return this.brandService.delete(ctx, id);
  }

  @Mutation()
  @Transaction()
  @Allow(brandsPermission.Update,Permission.UpdateCatalog)
  async editBrand(@Ctx() ctx: RequestContext, @Args('args') arg:BrandInputType):Promise<ProductBrand>{
    return await this.brandService.edit(ctx, arg);
  }
}
