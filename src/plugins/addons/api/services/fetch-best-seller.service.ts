import { ID, RequestContext,CollectionService, EntityHydrator, ProductVariantService, Collection } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
import {getRepository,Repository,IsNull} from 'typeorm';
import { BestSellerResult } from '../../generated-shop-types';
import { BestSellerEntity } from '../entities/best-sellers.entity';
@Injectable()
export class FetchBestSellersService{
    constructor(
        private categoryService: CollectionService,
        private hydrator: EntityHydrator, 
        private productVariantService: ProductVariantService,
        private collectionService: CollectionService
    ) {}
    
    async bestSellersInCategory(ctx: RequestContext, id:ID):Promise<BestSellerResult[]>{
        const bestSellerRepo= getRepository(BestSellerEntity);
        const hostCollection= await this.categoryService.findOne(ctx, id);
        return this.calculateAndParse(ctx,bestSellerRepo,hostCollection );
    }

    async bestSellingProducts(ctx: RequestContext):Promise<BestSellerResult[]>{
        const bestSellerRepo= getRepository(BestSellerEntity);
        return this.calculateAndParse(ctx,bestSellerRepo);
    }

    async calculateAndParse(ctx: RequestContext,bestSellerRepo: Repository<BestSellerEntity>,hostCollection?: Collection):Promise<BestSellerResult[]>{
        const selectedBestSellers= await bestSellerRepo.find({
            where: {
                collection: hostCollection?hostCollection:IsNull()
            }
        });
        let selectedFields:BestSellerResult[]= [];
        for(let item of selectedBestSellers){
            const priceWithTax= await this.productVariantService.hydratePriceFields( ctx, item.variant, 'priceWithTax',);
            const price= await this.productVariantService.hydratePriceFields( ctx, item.variant, 'price',);
            await this.hydrator.hydrate(ctx, item.variant, {
                relations: ['product.featuredAsset','product']
            })
            const image= 
            selectedFields.push({
                priceWithTax: `${priceWithTax}`,
                price: `${price}`,
                id: item.variant.product.id,
                collections: 
                    (await this.collectionService.getCollectionsByProductId(ctx,item.variant.product.id, true))
                    .map((item)=> item.id),
                description: item.variant.product.description,
                rating: `${item.variant.product.customFields.reviewRating}`,
                slug: item.variant.product.slug,
                image: item.variant?.featuredAsset?.source??item.variant.product?.featuredAsset?.source,
                name: item.variant.product.name,
                variantId: item.variant.id,
                sku: item.variant.sku,
                is_order_based: item.variant.product.customFields.is_order_based
            })
        }
        return selectedFields;
    }
}