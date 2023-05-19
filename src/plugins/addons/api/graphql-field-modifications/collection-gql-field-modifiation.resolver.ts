import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Product, Collection, CollectionService, ID, ProductVariantService, ProductVariant, PaginatedList, ProductService, } from '@etech/core';
@Resolver('Collection')
export class CollectionFieldOverride{
    constructor(private collectionService: CollectionService, private productService: ProductService,
        private productVariantService: ProductVariantService){

    }

    @ResolveField()
    async productVariants(@Ctx() ctx: RequestContext, @Parent() collection: Collection):Promise<PaginatedList<ProductVariant>> {
        let descendantProductVariantIds:ID[]= [...((await this.collectionService.getFilteredProductVariants(collection.filters)).filter((item)=> item.enabled && item.deletedAt === null).map((item)=> item.id))];
        let descendants= await this.collectionService.getDescendants(ctx, collection.id);
        for(let descendant of descendants){
            descendantProductVariantIds.push(...(await this.collectionService.getFilteredProductVariants(descendant.filters)).filter((item)=> item.enabled && item.deletedAt === null).map((item)=> item.id))
        }
        let items= await this.productVariantService.findByIds(ctx, descendantProductVariantIds);
        return {items: items, totalItems: items.length};
    }

    @ResolveField()
    async products(@Ctx() ctx: RequestContext, @Parent() collection: Collection):Promise<Product[]> {
        let descendantProductIds:ID[]= [...((await this.collectionService.getFilteredProductVariants(collection.filters)).filter((item)=> item.enabled && item.deletedAt === null).map((item)=> item.productId))];
        let descendants= await this.collectionService.getDescendants(ctx, collection.id);
        for(let descendant of descendants){
            descendantProductIds.push(...(await this.collectionService.getFilteredProductVariants(descendant.filters)).filter((item)=> item.enabled && item.deletedAt === null).map((item)=> item.productId))
        }
        let items= await this.productService.findByIds(ctx, descendantProductIds);
        return items;
    }
}