import { ID, idsAreEqual, Injector, PriceCalculationResult, 
    ProductVariantPriceCalculationArgs, 
    ProductVariantPriceCalculationStrategy, 
    TaxRateService } from "@etech/core";
import { NotVerifiedError } from "@etech/core/dist/common/error/generated-graphql-shop-errors";
import {getManager,EntityManager,getRepository,Repository} from 'typeorm';
import PriceList from "./price-list.entity";

export class EtechProductVariantPriceCalculationStrategy implements ProductVariantPriceCalculationStrategy{
    private taxRateService: TaxRateService;
    async calculate(args: ProductVariantPriceCalculationArgs): Promise<PriceCalculationResult> {
        const { inputPrice, activeTaxZone, ctx, taxCategory } = args;
        // console.log(ctx.req?.body);
        let price = inputPrice;
        let priceIncludesTax = false;
        const priceListRepo= getRepository(PriceList);
        const storeWideDiscountOptions= await this.storeWideDiscounts(priceListRepo,args.productVariant.id);
        let combined=[...storeWideDiscountOptions];
        // console.log(storeWideDiscountOptions.length,'hello man');
        if(ctx.activeUserId){
            const priceListLoggedInUserOptions= 
            await this.getLoggedInUserDiscount(priceListRepo,ctx.activeUserId,args.productVariant.id);
            combined=[...priceListLoggedInUserOptions,...combined];
        }
        if(combined.length){
            let mostDiscount=  combined.reduce((m:any,x)=> m.percentDiscount>x.percentDiscount ? m:x);
            price= parseInt(((((price * 
            (100-parseFloat(mostDiscount.percentDiscount)))))/100).toFixed(2));
            // console.log(price,mostDiscount,args.productVariant.id);
        }else{
            // console.log('no discount',args.productVariant.id)
        }
        if (ctx.channel.pricesIncludeTax) {
            const isDefaultZone = idsAreEqual(activeTaxZone.id, ctx.channel.defaultTaxZone.id);
            if (isDefaultZone) {
                priceIncludesTax = true;
            } else {
                const taxRateForDefaultZone = await this.taxRateService.getApplicableTaxRate(
                    ctx,
                    ctx.channel.defaultTaxZone,
                    taxCategory,
                );
                price = taxRateForDefaultZone.netPriceOf(inputPrice);
                
            }
        }
        return {
            price,
            priceIncludesTax,
        };
    }
    init(injector: Injector){
        this.taxRateService = injector.get(TaxRateService);
    }
    destroy?: () => void | Promise<void>;

    async storeWideDiscounts(priceListRepo:Repository<PriceList>, prodductVariantId:ID){
        return await priceListRepo.createQueryBuilder('priceList')
        .where(`priceList.id not in (
            select price_list.id from price_list 
            inner join price_list_product_variants_product_variant 
            on  price_list.id = price_list_product_variants_product_variant.priceListId 
         where price_list_product_variants_product_variant.productVariantId = ${prodductVariantId}
         and price_list.isPriceListStoreWide
         and price_list.enabled
        )`)
        .andWhere('priceList.isPriceListStoreWide')
        .andWhere('priceList.enabled')
        .select('priceList.percentDiscount')
        .getMany()
    }

    async getLoggedInUserDiscount(priceListRepo:Repository<PriceList>,activeUserId:ID, prodductVariantId:ID){
        // return await priceListRepo.createQueryBuilder('priceList')
        // .innerJoin('priceList.productVariants','productVariant')
        // .innerJoin('priceList.customerGroup','customerGroup')
        // .innerJoin('customerGroup.customers','customer')
        // .innerJoin('customer.user','user')
        // .where('user.id =:id',{id:activeUserId})
        // .andWhere('not priceList.isPriceListStoreWide')
        // .andWhere('productVariant.id = :id',{id: prodductVariantId})
        // .andWhere('priceList.enabled')
        // .select('priceList.percentDiscount')
        // .getMany();
        return await priceListRepo.query(`
            select price_list.percentDiscount from product_variant_price 
            inner join price_list_product_variants_product_variant 
            on  price_list_product_variants_product_variant.productVariantId = product_variant_price.variantId 
            inner join price_list on  price_list.id = price_list_product_variants_product_variant.priceListId 
            inner join customer_groups_customer_group on 
                customer_groups_customer_group.customerGroupId=price_list.customerGroupId 
            inner join customer on customer.id=customer_groups_customer_group.customerId 
            inner join user on user.id=customer.userId 
            where user.id=${activeUserId} 
            and product_variant_price.variantId=${prodductVariantId}
            and not price_list.isPriceListStoreWide
            and price_list.enabled;
        `)
    }

}