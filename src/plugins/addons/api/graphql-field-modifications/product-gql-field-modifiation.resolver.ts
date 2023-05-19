import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, ProductService, ProductVariant, Product, } from '@etech/core';
@Resolver('Product')
export class ProductFieldModification{
    constructor(private productService: ProductService){
    }

    @ResolveField()
    async accessories(@Ctx() ctx: RequestContext, @Parent() product: Product):Promise<Product[]> {
        // let customField:ProductCustomFields= product.customFields;
        if((product.customFields as any).accessories && ((product.customFields as any).accessories as string).trim() !== ''){
            return await this.productService.findByIds(ctx,  (product.customFields as any).accessories.split(',') );
        }
        return [];
    }
}