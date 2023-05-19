/**
 * Checks if the total order value is over a certain min threshold AND at the same time the total weight is under a max threshold.
 */

import { defaultShippingCalculator, LanguageCode, ShippingEligibilityChecker } from "@etech/core";
import { orderWeightLessThan, orderValueGreaterThan } from "./functions";
import { minimumValue, maximumWeight } from "./args";
import { CityDetail, selfPickup } from "../ui/types";
import { ConfigurableOperation } from "@etech/admin-ui/package/core";

export const valueWeightShippingEligibilityChecker =
  new ShippingEligibilityChecker({
    code: "value-shipping-eligibility-checker",
    description: [
      {
        languageCode: LanguageCode.en,
        value: "Shipping Eligibility Checker based on order value and weight",
      },
      {
        languageCode: LanguageCode.it,
        value: "Filtra in base al valore e al peso dell'ordine",
      },
    ],
    args: {
      orderMinimum: minimumValue,
      maximumWeight,
    },
    check: (ctx, order, args,method) => {
      const { orderMinimum, maximumWeight } = args;
      const shippingCity= order.shippingAddress.city;
      const calculator= method.calculator as ConfigurableOperation;
      if(shippingCity === selfPickup){
        return calculator.code === defaultShippingCalculator.code && 
        calculator.args[0].name ==='rate' && 
        calculator.args[0].value ==='0';
      }else{
        const weShipTo= calculator.args.find((item)=> item.name==='weShipTo');
        if(weShipTo){
            const typedWeShipTo= JSON.parse(weShipTo.value) as CityDetail[];
            const conditionTakingIntoConsiderationStoreLocation= 
            typedWeShipTo.some((item)=> item.city.toLowerCase() === shippingCity.toLowerCase() && 
            (item.isStoreLocation?method.customFields.supports_shipping_to_store_location:true))
            return (
              conditionTakingIntoConsiderationStoreLocation && 
               orderValueGreaterThan({ order, orderMinimum }) &&
              orderWeightLessThan({ order, maximumWeight })
            );
        }
        return (
           orderValueGreaterThan({ order, orderMinimum }) &&
          orderWeightLessThan({ order, maximumWeight })
        );
      }
    },
  });
