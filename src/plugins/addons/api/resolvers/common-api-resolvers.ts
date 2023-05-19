import { Ctx, RequestContext, Product, ID, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql'
import { BestSellerResult, RegisterEtechCustomerInput } from 'src/ui/generated/graphql';
import { Success } from '../../generated-shop-types';
import { CustomSearchService } from '../services/custom-search.service';
import { FetchBestSellersService } from '../services/fetch-best-seller.service';
import { ActiveOrderCancellationService } from '../services/active-order-cancellation.service';
import { RegisterEtechCustomerService } from '../services/register-etech-customer.service';
import { SetSelfPickupAsShippineMethodService } from '../services/set-self-pickup-shipping-method.service';

@Resolver()
export class CommonApiResolver{

    constructor(
        private bestSellersService: FetchBestSellersService,
        private searchService: CustomSearchService,
        private registerEtechCustomerService: RegisterEtechCustomerService,
        private customerOrderCancellationService: ActiveOrderCancellationService,
        private selfPickupShippingMethodSetter: SetSelfPickupAsShippineMethodService,
    ) {}

    @Query()
    async bestSellersInCategory(@Ctx() ctx: RequestContext, @Args('id') id:ID):Promise<BestSellerResult[]>{
        return this.bestSellersService.bestSellersInCategory(ctx, id);
    }

    @Query()
    async bestSellingProducts(@Ctx() ctx: RequestContext):Promise<any[]>{
        return this.bestSellersService.bestSellingProducts(ctx);
    }

    @Query()
    async simpleSearch(@Ctx() ctx: RequestContext, @Args("text") text:String):Promise<Product[]>{
       return this.searchService.simpleSearch(ctx, text);
    }

    @Mutation()
    @Transaction()
    async registerEtechCustomer(@Ctx() ctx: RequestContext, @Args("input") input:RegisterEtechCustomerInput):Promise<Success>{
       return this.registerEtechCustomerService.registerEtechCustomer(ctx, input);
    }

    @Mutation()
    @Transaction()
    async cancelMyOrder(@Ctx() ctx: RequestContext):Promise<Success>{
        return this.customerOrderCancellationService.cancelMyOrder(ctx);
    }

    @Mutation()
    @Transaction()
    async setSelfPickupAsShippingMethod(@Ctx() ctx: RequestContext):Promise<Success>{
        return this.selfPickupShippingMethodSetter.set(ctx);
    }
}