import { Injectable } from '@nestjs/common';
import { ProductService, RequestContext, AssetService, ID, Product, Translated, Asset, 
    TransactionalConnection, 
    EventBus} from '@etech/core';
import {getManager} from 'typeorm';
import { ProductBrand } from '../entities/brand-entity';
import { TagService } from '@etech/core/dist/service/services/tag.service';
import { BrandInputType } from '../../generated-admin-types';
import { ProductBrandEvent } from '../../events';
@Injectable()
export default class BrandService {
    // brandRepo: Repository<ProductBrand>;
    constructor(private productService: ProductService, 
        private assetService:AssetService,
        private tagService: TagService,
        private connection: TransactionalConnection,
        private eventBus: EventBus,
        ) {
        }
    async create(ctx: RequestContext, input: BrandInputType):Promise<ProductBrand>{ 
        let brand= new ProductBrand()
        brand.name= input.name;
        brand.description= unescape(input.description as string);
        if(input.iconId){
            const newIcon= (await this.assetService.findOne(ctx, input.iconId));
            if(newIcon instanceof Asset){
                brand.icon= newIcon;
                await this.assetService.update(ctx, {id: input.iconId, tags: ['Brand']})
                this
            }else{
                throw Error('Couldnt upload file.');
            }
        }
        let selectedProducts:Translated<Product>[];
        if(input.productIds.length > 0){
            selectedProducts= await this.productService.findByIds(ctx, input.productIds);
            brand.products= selectedProducts;
        }
        let brandRepo= this.connection.getRepository(ctx, ProductBrand);
        let productRepo= this.connection.getRepository(ctx, Product);
        const saved= await brandRepo.save(brand);
        if(input.productIds.length > 0){
            for(let selectedOne of selectedProducts){
                if(selectedOne.deletedAt === null){
                    selectedOne.customFields.brand= saved;
                    // await this.productService.update(ctx, selectedOne);
                }
            }
            await productRepo.save(selectedProducts);
        }
        this.eventBus.publish(new ProductBrandEvent(ctx, saved, "created",input ))
        return saved;
    }

    async list(ctx: RequestContext,):Promise<ProductBrand[]>{
        let brandRepo= this.connection.getRepository(ctx, ProductBrand);
        return await brandRepo.find();
    }

    async get(ctx: RequestContext, id:ID):Promise<ProductBrand>{
        let brandRepo= this.connection.getRepository(ctx, ProductBrand);
        return await brandRepo.findOne(id);
    }

    async delete(ctx: RequestContext, id:ID):Promise<ID>{
        let brandRepo= this.connection.getRepository(ctx, ProductBrand);
        const aboutTobeDeleted= await brandRepo.findOne(id);
        let deleteThis=await brandRepo.softDelete(id) as any;
        if(deleteThis != null){
            this.eventBus.publish(new ProductBrandEvent(ctx, aboutTobeDeleted, "deleted"))
            return id;
        }
        return -1;
    }

    async edit(ctx: RequestContext,input: BrandInputType):Promise<ProductBrand>{
        let brandRepo= this.connection.getRepository(ctx, ProductBrand);
        let originalVersion= await brandRepo.findOne(input.id); 
        let updated= new ProductBrand()
        updated.id= input.id;
        if(input.iconId){
            let newIcon= (await this.assetService.findOne(ctx, input.iconId));
            if(newIcon instanceof Asset){
                updated.icon= newIcon;
                await this.assetService.update(ctx, {id: input.iconId, tags: ['Brand']})
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
        const updateResult= await brandRepo.save(updated);
        if(updateResult){
            for(let unselectedProduct of originalVersion.products){
                (unselectedProduct.customFields as any).brand= null;
                if(unselectedProduct.deletedAt === null){
                    await this.productService.update(ctx, unselectedProduct);
                }else{
                    await getManager().query(`update product set brandId=NULL where id=${unselectedProduct.id}`);
                }
            }
            if(input.productIds.length >0){
                let selectedProducts= await this.productService.findByIds(ctx, input.productIds);
                for(let selectedOne of selectedProducts){
                    (selectedOne.customFields as any).brand= updated;
                    await this.productService.update(ctx, selectedOne);
                }
            }
            this.eventBus.publish(new ProductBrandEvent(ctx, updateResult, "updated", input, originalVersion))
            return updated;
        }
        throw Error('Couldnt update entity.');
    }
}