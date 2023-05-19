import { Injectable } from '@nestjs/common';
import {
    AssetService, ChannelService,
    ProductService,
    ProductVariantService,
    RequestContext,
    TransactionalConnection, TranslatableSaver, translateDeep
} from '@etech/core';
import {CmsEntity} from "../entities/cms.entity";
import {CreateCmsInput, Type} from "../generated-admin-types";
import {CmsTranslation} from "../entities/cms-translation-entity";
@Injectable()
export class CmsService {
    constructor(
        private connection: TransactionalConnection,
        private assetService: AssetService,
        private translatableSaver: TranslatableSaver,
        private productVariantService: ProductVariantService,
        private productService: ProductService,
        private channelService: ChannelService,
    ) {}
    async findOne(ctx: RequestContext, type: Type): Promise<CmsEntity | undefined> {
        const relations = ['featuredAsset', 'assets','channels'];
       // @ts-ignore
        let cms = await this.connection.getRepository(ctx, CmsEntity).findOne({cmsType:type},{relations,loadEagerRelations:true});
        if (!cms) {
            return;
        }
        return translateDeep(cms, ctx.languageCode);

    }
    async create(ctx: RequestContext, input: CreateCmsInput){
        let updatedInput:string[]=[]
        // console.log(input.content);
        if(input.cmsType == Type.BIG_SALE){
            for(let adIndex in JSON.parse(input.content[0])){
                // console.log((JSON.parse(input.content[0]) as string[])[adIndex]);
                let jsoned:any= (JSON.parse(input.content[0]) as (string[])[])[adIndex];
                let productIds= (await (this.productVariantService.findByIds(ctx, 
                    [jsoned.productVariantId])))
                    .map((variant)=> variant.productId);
                let productSlugs= (await this.productService.findByIds(ctx, productIds)).map((item)=> item.slug);
                updatedInput.push(JSON.stringify({...jsoned, productSlug: productSlugs[0]}))
            }
            input.content= [JSON.stringify(updatedInput)];
            // console.log(updatedInput);
        }
       const cms = await this.connection.getRepository(ctx,CmsEntity).findOne({cmsType:input.cmsType}) || await this.translatableSaver.create({
            ctx,
            input,
            entityType: CmsEntity,
            translationType: CmsTranslation,
            beforeSave: async c => {
                await this.channelService.assignToCurrentChannel(c, ctx);
            },
        });
        await this.assetService.updateFeaturedAsset(ctx, cms, input);
        // await this.assetService.updateEntityAssets(ctx, cms, input);
        return await this.connection.getRepository(ctx,CmsEntity).save({...cms, ...CmsEntity,...input})
    }
}

