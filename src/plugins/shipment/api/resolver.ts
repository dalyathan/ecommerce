import { Resolver,Query } from '@nestjs/graphql';
import { Ctx, RequestContext, ShippingMethodService} from '@etech/core';
import { ConfigurableOperation } from '@etech/admin-ui/package/core';
import { flightTimeBasedShippingCalculator,landDistanceBasedShippingCalculator } from '../calculators/weightCalculators';
import { CityDetail, selfPickup } from '../ui/types';
@Resolver()
export class ShopApiResolver{
    constructor(private shippingMethodService: ShippingMethodService){

    }

    @Query()
    async shippingAvailableTo(@Ctx() ctx: RequestContext):Promise<String[]>{
        const possibleMethods= await this.shippingMethodService.findAll(ctx);
        let cities:String[]=[selfPickup];
        for(const method of possibleMethods.items){
            const calculator= method.calculator as ConfigurableOperation;
            if(calculator.code === flightTimeBasedShippingCalculator.code ||
                calculator.code === landDistanceBasedShippingCalculator.code){
                    const weShipTo= calculator.args.find((item)=> item.name==='weShipTo');
                if(weShipTo){
                    const typedWeShipTo= JSON.parse(weShipTo.value) as CityDetail[];
                    cities=cities.concat(typedWeShipTo.map((item)=> item.city.toLowerCase()));
                }
            }
        }
        return [...new Set(cities)];
    }
}