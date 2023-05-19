import { Allow, Ctx, Permission, RequestContext, Transaction} from '@etech/core'
import { Resolver,Args,Mutation,Query } from '@nestjs/graphql';
import { ProductDocumentationService } from '../services/product-documentation.service';
import { UpdateBestSellersService } from '../services/update-best-seller.service';

@Resolver()
export class AdminApiResolver{

    constructor(
        private productDocumentationService: ProductDocumentationService,
        private updateBestSellersService: UpdateBestSellersService){}

    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCatalog, Permission.UpdateProduct)
    async uploadDocumentation(@Ctx() ctx: RequestContext, @Args() arg:any): Promise<String>{
        return this.productDocumentationService.uploadDocumentation(ctx, arg.input);
    }
    
    @Mutation()
    @Allow(Permission.UpdateCatalog, Permission.UpdateProduct)
    async updateBestSellers(@Ctx() ctx: RequestContext): Promise<Boolean>{
        return this.updateBestSellersService.goOverParentCollectionsAndUpdateBestSellers();
    }

    @Query()
    async lastTimeBestSellerWasUpdated(@Ctx() ctx: RequestContext):Promise<Date|undefined>{
        return await this.updateBestSellersService.lastTimeBestSellerWasUpdated(ctx);
    }
}