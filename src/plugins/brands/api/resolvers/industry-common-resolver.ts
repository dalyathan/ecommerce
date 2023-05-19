import { Args, Resolver, Query } from '@nestjs/graphql';
import { Ctx, ID, RequestContext} from '@etech/core';
import IndustryService from '../services/industry-service';
import { ProductIndustry } from '../entities/industry-entity';
import { IndustryType } from '../../generated-admin-types';


@Resolver('BrandShop')
export default class IndustryCommonApiResolver {

  constructor(
    private industryService: IndustryService
    ) {}

  @Query()
  async industries(@Ctx() ctx: RequestContext):Promise<ProductIndustry[]>{
    return this.industryService.list(ctx);
  }

  @Query()
  async industry(@Ctx() ctx: RequestContext, @Args('id') arg:ID):Promise<IndustryType>{
    return this.industryService.get(ctx, arg);
  }
}
