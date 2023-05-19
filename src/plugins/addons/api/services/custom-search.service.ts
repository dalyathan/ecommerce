import { Product, RequestContext, TransactionalConnection } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
@Injectable()
export class CustomSearchService{
    constructor(private connection: TransactionalConnection){
        
    }
    async simpleSearch(ctx: RequestContext, text:String):Promise<Product[]>{
        let likeProducts= await this.connection.getRepository(ctx,Product)
        .createQueryBuilder("product")
        .innerJoin("product.translations", "translations")
        .where("translations.name like :name", { name:`%${text}%`})
        .andWhere(`translations.languageCode="${ctx.languageCode}"`)
        .andWhere(`product.deletedAt is NULL`)
        .andWhere(`product.enabled`)
        .getMany();
        return likeProducts;
    }

}