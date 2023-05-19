import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, ProductService, ProductVariant, Product, TransactionalConnection, ProductPriceApplicator, ProductVariantPrice, Channel, ChannelService } from '@etech/core';
import { ProductVariantCustomFields } from '../../generated-shop-types';
import {getRepository} from 'typeorm';
@Resolver('ProductVariant')
export class ProductVariantFieldModification{
    constructor(private productService: ProductService,
        private connection: TransactionalConnection,
        private channelService: ChannelService,
        private productPriceApplicator: ProductPriceApplicator){
    }

    @ResolveField()
    async accessories(@Ctx() ctx: RequestContext, @Parent() productVariant: ProductVariant):Promise<Product[]> {
        let customField:ProductVariantCustomFields= productVariant.customFields;
        if(customField.accessories && customField.accessories.trim() !== ''){
            return await this.productService.findByIds(ctx,  customField.accessories.split(','), ['variants.productVariantPrices'] );
        }
        return [];
    }
    @ResolveField()
    async is_order_based(@Ctx() ctx: RequestContext, @Parent() productVariant: ProductVariant):Promise<boolean> {
        return productVariant.product.customFields.is_order_based;
    }

    @ResolveField()
    async priceWithoutDiscount(@Ctx() ctx: RequestContext, @Parent() productVariant: ProductVariant):Promise<number> {
        const productVariantPriceRepo= getRepository(ProductVariantPrice);
        const priceValue= await productVariantPriceRepo.findOne({where:{variant:productVariant, channelId: ctx.channelId}});
        const channel= await this.channelService.findOne(ctx, ctx.channelId);
        if(priceValue){
            if(channel.pricesIncludeTax){
                return productVariant.taxRateApplied.netPriceOf(priceValue.price);
            }else{
                return priceValue.price;
            }
        }
        // const nonAuthRequestContext=  new RequestContext({
        //     apiType: 'shop',
        //     isAuthorized: false,
        //     authorizedAsOwnerOnly: true,
        //     channel: ctx.channel,
        //   })
        //   const variantWithPrices = await this.connection.getEntityOrThrow(
        //     ctx,
        //     ProductVariant,
        //     productVariant.id,
        //     { relations: ['productVariantPrices','taxCategory'], includeSoftDeleted: true },
        // );
        // return (await this.productPriceApplicator.applyChannelPriceAndTax(variantWithPrices,nonAuthRequestContext)).price;
    }
}