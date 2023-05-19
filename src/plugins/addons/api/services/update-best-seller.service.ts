import { Allow, Channel, Collection, CollectionService, ConfigService, EntityHydrator, ID, OrderLine, Permission, ProductVariantService, 
    RequestContext, Transaction, TransactionalConnection } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
import {getRepository} from 'typeorm';
import { BestSellerEntity } from '../entities/best-sellers.entity';
import { default as dayjs } from 'dayjs';
@Injectable()
export class UpdateBestSellersService{
    constructor(
        private connection: TransactionalConnection, private hydrator: EntityHydrator, 
        private configService: ConfigService,
        private collectionService: CollectionService
    ) {}

    async updateBestSellersInCategory(ctx: RequestContext, id:ID):Promise<void>{
        // this is very inefficient query, i know
        const etechCatalogOptions= this.configService.catalogOptions;
        const completedOrders= await this.connection.getRepository(ctx, OrderLine)
        .createQueryBuilder("orderLine")
            .addSelect(['translations.name','translations.slug','count(product.id) as count'])
        .innerJoinAndSelect('orderLine.productVariant', 'productVariant')//, "productVariant.enabled AND productVariant.deletedAt IS NULL")
        .innerJoin('orderLine.order','order',)// "order.state='Delivered'")
        .innerJoin('order.channels','order_channel',)
        .innerJoin('productVariant.collections','collection',)//`collection.id=${id} OR collection.parentId=${id}`)
        .innerJoinAndSelect("productVariant.product","product",)// "product.enabled AND product.deletedAt IS NULL")
        .innerJoinAndSelect("product.translations","translations",)//`translations.languageCode='${ctx.languageCode}'`)
            .where(`translations.languageCode='${ctx.languageCode}'`)
            .andWhere(`collection.id=${id} OR collection.parentId=${id}`)
            .andWhere(`
                order.state='PaymentSettled' OR order.state='PartiallyShipped' OR
                order.state='Shipped' OR order.state='PartiallyDelivered' OR 
                order.state='ArrangingAdditionalPayment'
            `)
            .andWhere("product.deletedAt IS NULL")
            .andWhere("productVariant.deletedAt IS NULL")
            .andWhere("product.enabled")
            .andWhere("productVariant.enabled")
            .andWhere(`order_channel.id=${ctx.channelId}`)
        .addGroupBy('product.id')
        .addOrderBy('count', "DESC")
        .limit(etechCatalogOptions.maxBestSellersPerCategory)
        .getMany();
        const selectedFields:BestSellerEntity[]= [];
        const bestSellersRepository=getRepository(BestSellerEntity)
        const hostCollection= await this.collectionService.findOne(ctx, id);
        for(const item of completedOrders){
            await this.hydrator.hydrate(ctx, item.productVariant, {
                relations: ['product.featuredAsset','product']
            })
            const bestSeller= new BestSellerEntity();
            bestSeller.variant= item.productVariant;
            bestSeller.channels= [ctx.channel];
            bestSeller.collection= hostCollection;
            selectedFields.push(bestSeller);
        }
        // console.log(selectedFields.length, `id ${id}`)
        // const deleteResult= await bestSellersRepository.delete({collection: hostCollection, channels: [ctx.channel] });
        // console.log(`deleteResult of ${hostCollection.name} best seller update`,deleteResult)
        await bestSellersRepository.save(selectedFields);
        console.log(`${selectedFields.length} best sellers in channel ${ctx.channel.code} added for collection ${hostCollection.name}`)
        // return selectedFields;
    }

    async updateBestSellersOfAll(ctx: RequestContext):Promise<void>{
        const etechCatalogOptions= this.configService.catalogOptions;
        let completedOrders= await this.connection.getRepository(ctx, OrderLine)
        .createQueryBuilder("orderLine")
            .addSelect(['translations.name','translations.slug','count(product.id) as count'])
        .innerJoinAndSelect('orderLine.productVariant', 'productVariant',)//  "productVariant.enabled AND productVariant.deletedAt IS NULL")
        .innerJoin('orderLine.order','order',)//"order.state='Delivered'")
        .innerJoin('order.channels','order_channel',)
        .innerJoin('productVariant.collections','collection')
        .innerJoinAndSelect("productVariant.product","product",)//"product.enabled AND product.deletedAt IS NULL")
        .innerJoinAndSelect("product.translations","translations",)//`translations.languageCode='${ctx.languageCode}'`)
            .where(`translations.languageCode='${ctx.languageCode}'`)
            .andWhere(`collection.id>0 OR collection.parentId>0`)
            .andWhere(`
                order.state='PaymentSettled' OR order.state='PartiallyShipped' OR
                order.state='Shipped' OR order.state='PartiallyDelivered' OR 
                order.state='ArrangingAdditionalPayment'
            `)
            .andWhere("product.deletedAt IS NULL")
            .andWhere("productVariant.deletedAt IS NULL")
            .andWhere("product.enabled")
            .andWhere("productVariant.enabled")
            .andWhere(`order_channel.id=${ctx.channelId}`)
        .addGroupBy('product.id')
        .addOrderBy('count', "DESC")
        .limit(etechCatalogOptions.maxBestSellersOfAll)
        .getMany();
        let selectedFields:BestSellerEntity[]= []; 
        let bestSellersRepository=getRepository(BestSellerEntity)
        for(let item of completedOrders){
           await this.hydrator.hydrate(ctx, item.productVariant, {
                relations: ['product.featuredAsset',]
            })
            const bestSeller= new BestSellerEntity();
            bestSeller.variant= item.productVariant;
            bestSeller.channels= [ctx.channel];
            bestSeller.collection= null;
            selectedFields.push(bestSeller);
            
        }
        await bestSellersRepository.save(selectedFields);
        console.log(`${selectedFields.length} best sellers added in channel ${ctx.channel.code} for all collections`)
    }
    
   
    @Transaction()
    async goOverParentCollectionsAndUpdateBestSellers():Promise<Boolean>{
        const allCtxs= await this.getChannelSpecificRequestContexts();
        for(const ctx of allCtxs){
            const collectionRepo= getRepository(Collection);
            const bestSellersRepository=getRepository(BestSellerEntity)
            const result=await bestSellersRepository.createQueryBuilder('bestSeller').delete().execute();
            console.log(`${result.affected} best sellers deleted.`)
            const allParentCollections= await collectionRepo.
            createQueryBuilder("collection")
            .innerJoin('collection.channels', 'channel')
            .where(`collection.parentId = ${1}`)
            .andWhere(`NOT collection.isPrivate`)
            .andWhere(`channel.id= ${ctx.channelId}`)
            .getMany();
            console.log(allParentCollections.length, `collections in channel 
            ${ctx.channel.code} about to be updated`);
            for(const collection of allParentCollections){
                await this.updateBestSellersInCategory(ctx, collection.id);
            }
            await this.updateBestSellersOfAll(ctx);
        }
        return true;
    }

    async getChannelSpecificRequestContexts(){
        const allChannels= await getRepository(Channel).find();
        console.log(allChannels.map(c=> c.code))
        return allChannels.map((channel)=>new RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            channel,
          }));
    }

    async lastTimeBestSellerWasUpdated(ctx: RequestContext):Promise<Date|undefined>{
        const bestSellersRepository=getRepository(BestSellerEntity)
        const justOne= await bestSellersRepository.findOne({select:['id','createdAt','updatedAt']});
        if(justOne && justOne.createdAt){
            return justOne.updatedAt;
        }
    }
}