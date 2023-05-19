import { Args, Resolver, Query } from '@nestjs/graphql';
import { Ctx, ID, RequestContext} from '@etech/core';
import BrandService from '../services/brand-service';
import { ProductBrand } from '../entities/brand-entity';


@Resolver('BrandShop')
export default class BrandCommonApiResolver {

  constructor(
    private brandService: BrandService
    ) {}

  @Query()
  async brands(@Ctx() ctx: RequestContext):Promise<ProductBrand[]>{
    return this.brandService.list(ctx);
  }

  @Query()
  async brand(@Ctx() ctx: RequestContext, @Args() arg:ID):Promise<ProductBrand>{
    return this.brandService.get(ctx, arg);
  }
}
