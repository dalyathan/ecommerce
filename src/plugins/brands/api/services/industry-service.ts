import { Injectable } from '@nestjs/common';
import { Asset, ProductService, RequestContext, AssetService, ID, Translated, 
    EntityHydrator, Product as ProductEntity, TransactionalConnection, EventBus, } from '@etech/core';
import { ProductIndustry } from '../entities/industry-entity';
import {IndustryInputType, IndustryType, Product} from '../../generated-admin-types';
import { ProductIndustryEvent } from '../../events';
@Injectable()
export default class IndustryService {
    constructor(private productService: ProductService, 
            private connection: TransactionalConnection,
            private entityHydrator: EntityHydrator,
            private assetService:AssetService, 
            private eventBus: EventBus,
        ) {
        }
    
    async create(ctx: RequestContext, input: IndustryInputType):Promise<ProductIndustry>{ 
        let industry= new ProductIndustry()
        industry.name= input.name;
        industry.description= unescape(input.description as string);
        if(input.iconId !== null && input.iconId!== undefined && input.iconId !== ""){
            industry.icon= await this.assetService.findOne(ctx,input.iconId);
            await this.assetService.update(ctx, {id: input.iconId, tags: ['Industry']})
        }
        let selectedProducts:Translated<ProductEntity>[];
        if(input.productIds.length >0){
            selectedProducts= await this.productService.findByIds(ctx, input.productIds);
            // industry.products= selectedProducts;
        }
        const industryRepo= this.connection.getRepository(ctx, ProductIndustry);
        const saved= await industryRepo.save(industry);
        if(input.productIds.length>0){
            for(let selectedOne of selectedProducts){
                if(selectedOne.deletedAt === null){
                    (selectedOne.customFields as any).industry= saved;
                    await this.productService.update(ctx, selectedOne);
                }
            }
        }
        this.eventBus.publish(new ProductIndustryEvent(ctx, saved, "created",input ))
        return saved;
    }


    async list(ctx: RequestContext,):Promise<ProductIndustry[]>{
        const industryRepo= this.connection.getRepository(ctx, ProductIndustry);
        return await industryRepo.find();
    }

    async get(ctx: RequestContext, id:ID):Promise<IndustryType>{
        const industryRepo= this.connection.getRepository(ctx, ProductIndustry);
        let fromDb= await industryRepo.findOne(id);
        let products=  await this.thisIndustryProducts(ctx,id, false);
        // console.log(products.length)
        return {id: id, description: fromDb.description.toString(), icon: fromDb.icon,
            name: fromDb.name.toString(), products: products.map((item)=> item as unknown as Product)};
    }

    async thisIndustryProducts(ctx: RequestContext,id: ID, selecIndustryDetail: boolean):Promise<ProductEntity[]>{
        return await this.connection.getRepository(ctx, ProductEntity).createQueryBuilder('product')
            .leftJoinAndSelect('product.customFields.industries', 'product_industry',)
            .where('product_industry.id = :id', {id: id})
            .andWhere('product.enabled')
            .andWhere('product.deletedAt is NULL')
            .getMany();
    }

    async getProductsWithIndustry(ctx: RequestContext, ids: ID[]){
        return ids.length?await this.connection.getRepository(ctx, ProductEntity).createQueryBuilder('product')
            .leftJoinAndSelect('product.customFields.industries', 'product_industry',)
            .where('product.id IN (:...ids)', {ids: ids})
            .andWhere('product.enabled')
            .andWhere('product.deletedAt is NULL')
            .getMany():[];
    }

    async delete(ctx: RequestContext, id:ID):Promise<ID>{
        const industryRepo= this.connection.getRepository(ctx, ProductIndustry);
        const aboutTobeDeleted= await industryRepo.findOne(id);
        let deleteThis=await industryRepo.softDelete(id) as any;
        if(deleteThis != null){
            this.eventBus.publish(new ProductIndustryEvent(ctx, aboutTobeDeleted, "deleted"))
            return id;
        }
        return -1;
    }

    async edit(ctx: RequestContext, input: IndustryInputType):Promise<ProductIndustry>{ 
        let existingProducts=  await this.thisIndustryProducts(ctx, input.id, true);
        const industryRepo= this.connection.getRepository(ctx, ProductIndustry);
        let originalVersion= await industryRepo.findOne(input.id);
        let updated= new ProductIndustry()
        updated.id= input.id;
        if(input.iconId){
            let newIcon= (await this.assetService.findOne(ctx, input.iconId));
            if(newIcon instanceof Asset){
                updated.icon= newIcon;
                await this.assetService.update(ctx, {id: input.iconId, tags: ['Industry']})
                this
            }else{
                throw Error('Couldnt choose file.');
            }
        }else{
            updated.icon= originalVersion.icon;
        }
        if(input.name){
            updated.name= input.name;
        }else{
            updated.name= originalVersion.name;
        }
        if(input.description){
            updated.description= unescape(input.description as string);
        }else{
            updated.description= originalVersion.description;
        }
        let saved= await industryRepo.save(updated);
        // let chosenProductIds:[]
        if(input.productIds){
            let changes:string="";
            if(input.productIds.length){
                let freshOnes= await this.getProductsWithIndustry(ctx,
                    input.productIds.filter((chosenId)=> 
                    existingProducts.filter((existing)=> existing.id === chosenId).length === 0));
                //inOldOutNew
                let delteConditions=[];
                for(let existingProduct of existingProducts){
                    let isChosen:boolean= false;
                    for(let updatedProductId of input.productIds){
                        if(existingProduct.id === updatedProductId){
                            isChosen= true;
                            // break;
                        }
                    }
                    if(!isChosen){
                        delteConditions.push(`(productId=${existingProduct.id} and productIndustryId=${saved.id})`);
                    }
                }
                if(delteConditions.length){
                    let lastChange= ` delete from 
                    product_custom_fields_industries_product_industry where ${delteConditions.join(' OR ')};`;
                    changes+= lastChange;
                    await this.connection.rawConnection.query(lastChange);
                }
                let insertionValues=[];
                for(let fresh of freshOnes){
                    insertionValues.push(`(${fresh.id},${saved.id})`);
                }
                if(insertionValues.length){
                    let lastChange= ` insert into product_custom_fields_industries_product_industry values ${insertionValues.join(' , ')};`;
                    changes+= lastChange;
                    await this.connection.rawConnection.query(lastChange);
                }
            }else{
                let lastChange= ` delete from 
                product_custom_fields_industries_product_industry where productIndustryId=${saved.id}`;
                changes+= lastChange;
                await this.connection.rawConnection.query(lastChange);
            }
            // if(changes.trim() !== ''){
            //     console.log(changes);
            //     // await this.connection.rawConnection.query(changes);
            // }
        }
        this.eventBus.publish(new ProductIndustryEvent(ctx, saved, "updated", input, originalVersion))
        return saved;
    }
}