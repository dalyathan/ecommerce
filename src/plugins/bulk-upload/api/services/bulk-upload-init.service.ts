import { Asset, AssetService, InternalServerError, LanguageCode, ProductOptionGroupService, ProductOptionService, ProductService, ProductVariantService, RequestContext } from '@etech/core';
import {
    Injectable,
    BadRequestException,
  } from '@nestjs/common';
import { ActualProduct, CreateProductOptionGroupInput, GlobalFlag } from '../../ui/generated-admin-types';
import { WriteableProduct } from './writeable.entities';
import { GraphQLError } from 'graphql';
@Injectable()
export class BulkUploadInitService{
    continueNextStep:boolean= false;
    writeableProducts: WriteableProduct[];
    constructor(private pvs: ProductVariantService,
       private as: AssetService, private ps: ProductService,
       private pogs: ProductOptionGroupService, private pos:ProductOptionService){

    }


    async init(ctx: RequestContext,input:ActualProduct[]):Promise<String>{
      this.writeableProducts= input.map((c)=> new WriteableProduct(c));
      try{
        await this.checkSkuUniqueness(ctx);
        await this.createAssets(ctx);
        await this.createProducts(ctx);
        await this.createProductOptionGroups(ctx);
        await this.addOptionGroupsToProducts(ctx);
        await this.createProductVariants(ctx);
        return `
          ${this.writeableProducts.length} 
          product${this.writeableProducts.length>1?'s':''} 
          with variants successfully created.
        `;
      }catch(e){
        console.log(e);
        return e.message;
      }
    }
    
    async checkSkuUniqueness(ctx: RequestContext):Promise<void>{
      const skus=(this.writeableProducts.map((p)=>p.variants).map((v)=>v.map((e)=>e.sku))).flat();
      const results= await this.pvs.checkSKUs(ctx, skus);
      for(let i=0;i<results.length;i++){
        if(!results[i]){
          throw new Error(`sku ${skus[i]} already exists`);
        }
      }
    }

    async createAssets(ctx: RequestContext):Promise<void>{
      for(const p of this.writeableProducts){
        const assetHeree= await this.as.create(ctx, p.featuredAsset);
        if(assetHeree instanceof Asset){
          p.assetId= assetHeree.id;
        }else{
          throw new Error(`asset for product ${p.name} couldnt be created`);
        }
        for(const v of p.variants){
          const assetHeree= await this.as.create(ctx, v.featuredAsset);
          if(assetHeree instanceof Asset){
            v.assetId= assetHeree.id;
          }else{
            throw new Error(`asset for variant ${v.name} couldnt be created`);
          }
        }
      }
    }

    async createProducts(ctx: RequestContext){
      for(const p of this.writeableProducts){
          var productEnglishTranslationInput={
            languageCode: LanguageCode.en,
            name: p.name,
            slug: p.slug,
            description: p.description,
        };
        const productEntity= await this.ps.create(ctx, {
          featuredAssetId: p.assetId,
          enabled: true,
          translations: [productEnglishTranslationInput]
        })
        p.productId= productEntity.id;
      }

    }

    async createProductOptionGroups(ctx: RequestContext){
      for(const p of this.writeableProducts){
        for(var optionGroupIndex in p.options){
          var createProductOptionGroupsInput:CreateProductOptionGroupInput={
              code: p.options[optionGroupIndex],
              translations: [
                  {
                      languageCode: LanguageCode.en,
                      name: p.options[optionGroupIndex],
                  }
              ],
              options: p.variants.map((variant)=>{
                  let optionValues= variant.values;
                      return {
                          code: optionValues[optionGroupIndex],
                          translations: [
                              {
                                  languageCode:  LanguageCode.en,
                                  name: optionValues[optionGroupIndex],
                              }
                          ]
                      }
                  }
              )
          }
          const reply= await this.pogs.create(ctx, createProductOptionGroupsInput);
          if (p.options && p.options.length) {
              for (const option of createProductOptionGroupsInput.options) {
                  const newOption = await this.pos.create(ctx, reply, option);
                  reply.options.push(newOption);
              }
          }
          // console.log(reply);
          p.optionGroupIds.push(parseInt(reply.id as string));
          for(const vIndex in p.variants){
            p.variants[vIndex].assignedOptionIds.push(parseInt(reply.options[vIndex].id as string));
          }
        }
      }
    }

    async addOptionGroupsToProducts(ctx: RequestContext){
      for(var possibleProduct of this.writeableProducts){
        for(var optionGroupId of possibleProduct.optionGroupIds){
          await this.ps.addOptionGroupToProduct(ctx,possibleProduct.productId, optionGroupId)
        }
      }
    }

    async createProductVariants(ctx: RequestContext){
      for(const p of this.writeableProducts){
        await this.pvs.create(ctx, p.variants.map((variant)=> {
              return {
                productId: p.productId,
                sku: variant.sku,
                price: parseInt(variant.price.toFixed(2).replace('.','')),
                stockOnHand: variant.stockOnHand,
                optionIds: variant.assignedOptionIds,
                featuredAssetId: variant.assetId,
                trackInventory: GlobalFlag.TRUE,
                customFields: {
                    description: variant.description
                },
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: variant.name + ' '+variant.values.join(' '),
                    }
                ],
            };
          }
        ))
      }
    }

}