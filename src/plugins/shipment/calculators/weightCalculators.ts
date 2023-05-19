/**
 * This custom shipping price calculator takes a weight unit of measure (weightUoM), a list of minimum weight thresholds
 * and a corresponding list of prices to apply to each price range, plus a default pricing.
 * So if for example the weight unit is kg, the weight thresholds are [1, 3, 6], the corresponding prices are [10, 20, 30]
 * and the default price is 5, if the order weight is 1 to 2.9 Kg, the price will be 10€, if the weight is 3 to 5.9 Kg the price
 * will be 20, from 6 Kg and more it will be 30. If the weight doesn't fall into any range (e.g. in this example it is under 1 Kg)
 * the default price will be applied.
 */

import {
  LanguageCode,
  CalculateShippingFn,
  ShippingCalculator,
} from "@etech/core";
import { ProductVariantDimensions } from "../../addons/ui/components/dimensions.product-variant.custom-field.component";
import {CityDetail,WeightShippingCalculatorArgsType} from '../ui/types';
import { WeightUnit } from "../ui/types";
import { getOrderWeight } from "../utils";

const calculateWeightBasedShippingCost: CalculateShippingFn<WeightShippingCalculatorArgsType> =
  async (ctx, order, args) => {
    const {
      // weightUoM,
      // minWeights,
      // correspondingPrices,
      // defaultPrice,
      perPrice,
      weShipTo,
      perVolumePrice,
      perWeightPrice
      // correspondingVolumePrices,
      // defaultVolumePrice,
      // minVolumes
    } = args;
    const shippingCity= order.shippingAddress.city;
   const shippingCitiesList=JSON.parse(weShipTo) as CityDetail[];
    // get products' custom fields (weight ecc.) from order and calculate total
    const totalWeight = getOrderWeight(order);
    const totalVolume= order.lines.reduce((total, line) =>
    {
      const dimensions= JSON.parse(line.productVariant.customFields.dimensions) as ProductVariantDimensions;
      return total + (dimensions?(dimensions.length*dimensions.width*dimensions.height*line.quantity):0);
    }, 0)
    const getAdditionalShippingCosts:number= order.lines.reduce((total, line) => 
    total + line.productVariant.customFields.additional_shipping_cost, 0)
    // const sortedWeights = (minWeights as any as number[]).sort(
    //   (a: number, b: number) => a - b
    // );
    // const sortedPrices = (correspondingPrices as any as number[]).sort(
    //   (a: number, b: number) => a - b
    // );
    // const sortedVolumes = (minVolumes as any as number[]).sort(
    //   (a: number, b: number) => a - b
    // );
    // const sortedVolumePrices = (correspondingVolumePrices as any as number[]).sort(
    //   (a: number, b: number) => a - b
    // );
    let shipmentPrice: number = getAdditionalShippingCosts;
    console.log(getAdditionalShippingCosts,'getAdditionalShippingCosts')
    let distanceOrFlightTimeBasedPrice=0;
    for(const cityShippingDetail of shippingCitiesList){
      if(cityShippingDetail.city === shippingCity){
        if(cityShippingDetail.isStoreLocation){
          distanceOrFlightTimeBasedPrice= totalWeight?cityShippingDetail.distanceFromStoreLocation*100:0;
        }else{
          distanceOrFlightTimeBasedPrice= totalWeight?cityShippingDetail.distanceFromStoreLocation*perPrice*100:0;
        }
        break;
      }
    }
    shipmentPrice+= distanceOrFlightTimeBasedPrice*order.lines.reduce((total,line)=> total+line.quantity,0);
    shipmentPrice+=perVolumePrice*totalVolume*100;
    shipmentPrice+=perWeightPrice*totalWeight*100;
    // let isPriceBasedOnWeightApplied= false;
    // for (let i = sortedWeights.length - 1; i >= 0; i--) {
    //   const currentWeight = Number.isNaN(sortedWeights[i])
    //     ? 0
    //     : sortedWeights[i];
    //   // comincio dal peso più alto
    //   if (totalWeight >= currentWeight) {
    //     shipmentPrice += sortedPrices[i];
    //     isPriceBasedOnWeightApplied=true;
    //     break; //esci dal ciclo for
    //   }
    // }
    // if(!isPriceBasedOnWeightApplied){
    //   shipmentPrice+=defaultPrice;
    // }
    // let isPriceBasedOnVolumeApplied= false;
    // for (let i = sortedVolumes.length - 1; i >= 0; i--) {
    //   const currentVolume = Number.isNaN(sortedVolumes[i])
    //     ? 0
    //     : sortedVolumes[i];
    //   if (totalVolume >= currentVolume) {
    //     shipmentPrice += sortedVolumePrices[i];
    //     isPriceBasedOnVolumeApplied=true;
    //     break;
    //   }
    // }
    // if(!isPriceBasedOnVolumeApplied){
    //   shipmentPrice+=defaultVolumePrice;
    // }
    return {
      price:shipmentPrice,
      taxRate:0,
      priceIncludesTax: ctx.channel.pricesIncludeTax,
      metadata: {
        // penso nulla
      },
    };
  };

export const landDistanceBasedShippingCalculator = new ShippingCalculator({
  code: "weight-and-land-distance-shipping-calculator",
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Based on Parcel Weight,Volume and Land Distance",
    },
    {
      languageCode: LanguageCode.it,
      value: "Peso della spedizione",
    },
  ],
  args: {
    // minWeights: {
    //   //Il minimo peso a partire da cui è applicato il relativo prezzo
    //   type: "float",
    //   list: true,
    //   ui: { component: "number-form-input", suffix: 'kg' },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The minimum weight thresholds that determine which price to apply to the shipment",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "Le soglie di peso minimo che determinano le fasce di prezzo da applicare alla spedizione",
    //     },
    //   ],
    // },
    // correspondingPrices: {
    //   //Applico il prezzo i se il peso è almeno pari a i e non c'è una fascia più prossima
    //   type: "float",
    //   list: true,
    //   ui: { component: "currency-form-input" },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The shipment prices to apply (for example price number 1 is applied if the parcel weight is at least equal to the weight threshold number 1, but less than the threshold number 2. Please note all values are sorted in ascending order!",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "I valori di prezzo da applicare (ad esempio il prezzo numero 1 è applicato se il peso della spedizione è almeno pari alla soglia di peso numero 1 ma inferiore alla numero 2. Nota bene: tutti i valori sono ordinati in ordine crescente!",
    //     },
    //   ],
    // },
    // defaultPrice: {
    //   type: "float",
    //   ui: { component: "currency-form-input" },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The shipment price to apply if the weight doesn't fit in any weight threshold",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "Il valore di prezzo da applicare se il peso non ricade in nessuna fascia di peso specificata",
    //     },
    //   ],
    // },
    // minVolumes: {
    //   //Il minimo peso a partire da cui è applicato il relativo prezzo
    //   type: "float",
    //   list: true,
    //   ui: { component: "number-form-input", suffix: 'cm3' },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The minimum volume thresholds that determine which price to apply to the shipment",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "Le soglie di peso minimo che determinano le fasce di prezzo da applicare alla spedizione",
    //     },
    //   ],
    // },
    // correspondingVolumePrices: {
    //   //Applico il prezzo i se il peso è almeno pari a i e non c'è una fascia più prossima
    //   type: "float",
    //   list: true,
    //   ui: { component: "currency-form-input" },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The shipment prices to apply (for example price number 1 is applied if the parcel volume is at least equal to the volume threshold number 1, but less than the threshold number 2. Please note all values are sorted in ascending order!",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "I valori di prezzo da applicare (ad esempio il prezzo numero 1 è applicato se il peso della spedizione è almeno pari alla soglia di peso numero 1 ma inferiore alla numero 2. Nota bene: tutti i valori sono ordinati in ordine crescente!",
    //     },
    //   ],
    // },
    // defaultVolumePrice: {
    //   type: "float",
    //   ui: { component: "currency-form-input" },
    //   label: [
    //     {
    //       languageCode: LanguageCode.en,
    //       value:
    //         "The shipment price to apply if the volume doesn't fit in any volume threshold",
    //     },
    //     {
    //       languageCode: LanguageCode.it,
    //       value:
    //         "Il valore di prezzo da applicare se il peso non ricade in nessuna fascia di peso specificata",
    //     },
    //   ],
    // },
    perVolumePrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/cm3', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per Volume",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    perWeightPrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/kg', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per Weight",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    perPrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/km', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per KMs",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    weShipTo: {
      type: "string",
      ui: { component: "we-ship-with-land-to"},
      label: [
        {
          languageCode: LanguageCode.en,
          value: "We ship to",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
  },
  calculate: calculateWeightBasedShippingCost,
});

export const flightTimeBasedShippingCalculator = new ShippingCalculator({
  code: "weight-and-flight-time-shipping-calculator",
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Based on Parcel Weight,Volume and Flight Time",
    },
    {
      languageCode: LanguageCode.it,
      value: "Peso della spedizione",
    },
  ],
  args: {
    perVolumePrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/cm3', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per Volume",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    perWeightPrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/kg', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per Weight",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    perPrice: {
      type: "float",
      ui: { component: "number-form-input", suffix: 'ETB/hr', min:0, step:0.01 },
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Shipping Cost Per Hrs",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
    weShipTo: {
      type: "string",
      ui: { component: "we-ship-with-air-to"},
      label: [
        {
          languageCode: LanguageCode.en,
          value: "We ship to",
        },
        {
          languageCode: LanguageCode.it,
          value:
            "Il valore percentuale delle tasse da imporre sul prezzo di spedizione (opzionale)",
        },
      ],
    },
  },
  calculate: calculateWeightBasedShippingCost,
});
