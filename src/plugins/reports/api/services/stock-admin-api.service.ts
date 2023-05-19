import { Channel, ChannelService, Ctx, GlobalSettings, GlobalSettingsService, OrderLine, ProductVariant, ProductVariantService, 
  RequestContext, TransactionalConnection, UserService, } from '@etech/core';
import { StockReport, StockReportContent, StockReportFilter } from '../../ui/generated-admin-types';
import PriceList from '../../../price-list/api/price-list.entity';
import {Injectable} from '@nestjs/common';

@Injectable()
export class StockReportService{
    constructor(private connection: TransactionalConnection, 
      private userService: UserService,
      private globalSettingsService: GlobalSettingsService,
      private productVariantService: ProductVariantService){
    }
    
    async getStockReport(ctx: RequestContext,filter: StockReportFilter): Promise<StockReport>{
      let dayjs= require('dayjs');
      let userAdmin= await this.userService.getUserById(ctx, ctx.activeUserId);
      let header:string=``;  
      let productVariants= this.connection.getRepository(ctx, ProductVariant)
        .createQueryBuilder("productVariant")
        .innerJoinAndSelect("productVariant.product", "product", "product.enabled AND product.deletedAt IS NULL")
        .innerJoinAndSelect("productVariant.translations", "translations")
        .leftJoinAndSelect("product.featuredAsset", "productFeaturedAsset")
        .leftJoinAndSelect("productVariant.featuredAsset", "productVariantFeaturedAsset");
        if(filter.createdAt){
            if(filter.createdAt.before){
                productVariants= productVariants.andWhere(
                    `productVariant.createdAt <
                    :end`,
                    {
                      end: filter.createdAt.before,
                    }
                  )
                  header+=` which have been added before ${dayjs(filter.createdAt.before).format('ddd, MMM D, YYYY h:mm A ')}`
            }else if(filter.createdAt.after){
                productVariants= productVariants.andWhere(
                    `productVariant.createdAt
                         >= :begin
                     `,
                    {
                      begin: filter.createdAt.after,
                    }
                  )
                  header+=` which have been added after ${dayjs(filter.createdAt.after).format('ddd, MMM D, YYYY h:mm A ')}`
            }else if(filter.createdAt.between){
                productVariants= productVariants.andWhere(
                    `productVariant.createdAt
                    >= :begin AND productVariant.createdAt <=
                      :end`,
                    {
                      begin: filter.createdAt.between.start,
                      end: filter.createdAt.between.end,
                    }
                  )
                  header+=` which have been added after ${dayjs(filter.createdAt.between.start).format('ddd, MMM D, YYYY h:mm A ')} and
                   before ${dayjs(filter.createdAt.between.end).format('ddd, MMM D, YYYY h:mm A ')}`
            }else{
              //no condition, suppose to be empty object
              if(Object.keys(filter.createdAt).length !== 0){
                console.log('Unexpected createdAt');
              }
            }
        }
        if(filter.stockOnHand){
            productVariants= productVariants.andWhere(`productVariant.stockOnHand=${filter.stockOnHand}`)
            header+=`, which have ${filter.stockOnHand} items in stock not yet allocated`
        }

        let selectedProductVariants=await productVariants
        .andWhere("productVariant.enabled AND productVariant.deletedAt IS NULL")
        .getMany();

        let segmentPrices= await this.getSegmentPrices(ctx);
        let solds= {};
        if(filter.stockFrom){
          solds= await this.getSoldAmountsSince(ctx, new Date(filter.stockFrom));
          header+=`, with stock values on ${dayjs(filter.stockFrom).format('ddd, MMM D, YYYY h:mm A ')}`
        }
        // header+=".";
        let reportContent:StockReportContent[]=[];
        const channelRepo= this.connection.getRepository(ctx, Channel);
        let this_channel= await channelRepo.findOne({where:{id:ctx.channelId}, 
          // select:['pricesIncludeTax','id']
        });
        // console.log(selectedProductVariants[0])
        const globalOutOfStockThreshold= (await this.globalSettingsService.getSettings(ctx)).outOfStockThreshold;
        for(let productVariant of selectedProductVariants){
          //the price list with the most precentDiscount should be taken
            let priceList=segmentPrices.find((item)=> item.productVariants[0].id == productVariant.id);
            let price= await this.productVariantService.
              hydratePriceFields(ctx, productVariant, this_channel.pricesIncludeTax?'priceWithTax':'price');
            reportContent.push({
               productId: productVariant.product.id,
                img: '/assets/'+ (productVariant.featuredAsset? 
                  productVariant.featuredAsset.preview:
                    productVariant.product.featuredAsset? productVariant.product.featuredAsset.preview:null)+'?preset=tiny',
                sku: productVariant.sku,
                closingStock: productVariant.useGlobalOutOfStockThreshold?globalOutOfStockThreshold.toString(): productVariant.outOfStockThreshold.toString(),
                name: productVariant.translations.find((item)=>item.languageCode=ctx.languageCode).name,
                createdAt: productVariant.createdAt.toDateString(),
                openingStock: filter.stockFrom?
                ( productVariant.stockOnHand + (solds[productVariant.id]?solds[productVariant.id]:0) as number).toString():productVariant.stockOnHand.toString(),
                defaultPrice: `${(price/100).toLocaleString("en-US")} ETB`,
                customerGroup:  priceList ? priceList.customerGroup.name : 'Unavailable',
                segmentPrice: priceList ? `${((1 - (parseFloat(priceList.percentDiscount)/100)) * (price/100)).toLocaleString("en-US")} ETB`:'Unavailable',
                stockOnHand: productVariant.stockOnHand.toString(),
            });
        }
        return {
          content:reportContent, 
          header: `This report, generated by ${userAdmin.identifier}, contains ${reportContent.length} products variants`+header, 
          priceIncludesTax: this_channel.pricesIncludeTax};
    }

    async getSegmentPrices(ctx: RequestContext): Promise<PriceList[]>{
      return await this.connection.getRepository(ctx, PriceList)
      .createQueryBuilder("priceList")
      .innerJoin("priceList.productVariants", "pV")
      .addSelect(["pV.id"])
      .innerJoin("priceList.customerGroup","customerGroup")
      .addSelect(["customerGroup.name"])
      .andWhere("pV.enabled AND pV.deletedAt IS NULL")
      .getMany();
    }

    async getSoldAmountsSince(ctx: RequestContext,day:Date):Promise<any>{
      let mysqlDatetimeFormat= day.toJSON().slice(0, 19).replace('T', ' ');
      let soldSince= await this.connection.getRepository(ctx, OrderLine)
        .createQueryBuilder("orderLine")
        .innerJoin('orderLine.productVariant', 'productVariant', "productVariant.enabled AND productVariant.deletedAt IS NULL")
        .innerJoin('orderLine.order','order', `order.state='Delivered'`)
        .innerJoin('orderLine.items','orderItem')
        .select(['orderLine.productVariantId','orderLine.id'])
        .where(`orderItem.updatedAt > '${mysqlDatetimeFormat}'`)
        .addGroupBy('orderLine.id')
        .addSelect('count(orderItem.id) as order_items')
        .addGroupBy('orderLine.productVariantId')
        .getRawMany();
        let finalValue:any={}
        for(let data of soldSince){
          if(finalValue[data.productVariantId] == undefined || finalValue[data.productVariantId] == null){
            finalValue[data.productVariantId]= parseInt(data.order_items)
          }else{
            finalValue[data.productVariantId]+= parseInt(data.order_items)
          }
        }
        return finalValue;
    }
}