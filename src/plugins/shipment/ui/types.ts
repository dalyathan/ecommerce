/**
 * The weight unit of measures supported by this plugin
 */

import { LanguageCode } from "@etech/core";
import { ConfigArgs } from "@etech/core/dist/common/configurable-operation";

export type WeightUnit = "g" | "kg";

export const selfPickup='Self Pickup';

export class CityDetail{
  id:number;
  isStoreLocation:Boolean;
  city: String;
  distanceFromStoreLocation:number;
}

export class TransportMeansInfo{
  name:String;
  chargingMetric:String;
  supportShippingToStoreLocation:Boolean;
}
export type WeightShippingCalculatorArgsType = {
  // minWeights: {
  //   type: "float";
  //   list: boolean;
  //   ui: {
  //     component: string;
  //     suffix: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  // correspondingPrices: {
  //   type: "float";
  //   list: boolean;
  //   ui: {
  //     component: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  // defaultPrice: {
  //   type: "float";
  //   ui: {
  //     component: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  // minVolumes: {
  //   type: "float";
  //   list: boolean;
  //   ui: {
  //     component: string;
  //     suffix: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  // correspondingVolumePrices: {
  //   type: "float";
  //   list: boolean;
  //   ui: {
  //     component: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  // defaultVolumePrice: {
  //   type: "float";
  //   ui: {
  //     component: string;
  //   };
  //   label: (
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //     | {
  //         languageCode: LanguageCode;
  //         value: string;
  //       }
  //   )[];
  // };
  perVolumePrice: {
    type: "float";
    ui: {
      component: string;
      min:number;
      step:number;
      suffix:string;
    };
    label: (
      | {
          languageCode: LanguageCode.en;
          value: string;
        }
      | {
          languageCode: LanguageCode.it;
          value: string;
        }
    )[];
  };
  perWeightPrice: {
    type: "float";
    ui: {
      component: string;
      min:number;
      step:number;
      suffix:string;
    };
    label: (
      | {
          languageCode: LanguageCode.en;
          value: string;
        }
      | {
          languageCode: LanguageCode.it;
          value: string;
        }
    )[];
  };
  perPrice: {
    type: "float";
    ui: {
      component: string;
      min:number;
      step:number;
      suffix:string;
    };
    label: (
      | {
          languageCode: LanguageCode.en;
          value: string;
        }
      | {
          languageCode: LanguageCode.it;
          value: string;
        }
    )[];
  };
  weShipTo:{
    type: "string";
    ui: {
      component: string;
    };
    label: (
      | {
          languageCode: LanguageCode.en;
          value: string;
        }
      | {
          languageCode: LanguageCode.it;
          value: string;
        }
    )[];
  }
}