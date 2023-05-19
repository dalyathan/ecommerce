import { containsProducts, Ctx, CustomerGroup, CustomerGroupService, CustomerService, ID, ProductVariant, ProductVariantService, RequestContext, Transaction, TransactionalConnection } from '@etech/core';
import {Resolver, Query, Mutation, Args, Parent,ResolveField} from '@nestjs/graphql';
import  PriceList  from './price-list.entity';
import {Repository,getRepository,getManager} from 'typeorm';
import { EditPriceListInput, PriceListCreationError, PriceListDisplay,PriceListInput } from '../ui/generated-admin-types';
import { PriceListService } from './price-list.service';
@Resolver()
export class ApiResolver{

    constructor(
        private priceListService:PriceListService){
    }

    @Mutation()
    @Transaction()
    async createPriceList(@Ctx() ctx: RequestContext, @Args('input') createPriceListInput: PriceListInput):Promise<PriceListDisplay>{
        return await this.priceListService.createPriceList(ctx, createPriceListInput);
    }

    @Mutation()
    @Transaction()
    async createStoreWideDiscount(@Ctx() ctx: RequestContext, @Args('input') createPriceListInput: PriceListInput):Promise<PriceListDisplay>{
        return await this.priceListService.createStoreWideDiscount(ctx, createPriceListInput);
    }

    @Mutation()
    @Transaction()
    async editStoreWideDiscount(@Ctx() ctx: RequestContext, @Args('input') editPriceListInput: EditPriceListInput):Promise<PriceListDisplay>{
        return await this.priceListService.editStoreWideDiscount(ctx, editPriceListInput);
    }

    @Mutation()
    @Transaction()
    async editPriceList(@Ctx() ctx: RequestContext, @Args('input') editPriceListInput: EditPriceListInput):Promise<PriceListDisplay>{
        return await this.priceListService.editPriceList(ctx, editPriceListInput);
    }

    @Query()
    async priceLists(@Ctx() ctx: RequestContext):Promise<PriceListDisplay[]>{
        return await this.priceListService.priceLists(ctx);
    }

    @Mutation()
    @Transaction()
    async togglePriceList(@Ctx() ctx: RequestContext, @Args('id') priceListId: ID): Promise<PriceListDisplay>{
        return await this.priceListService.togglePriceList(ctx, priceListId);
    }

    
}