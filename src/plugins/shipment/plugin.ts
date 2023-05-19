/**
 * Configures the plugins by registering the checkers, the calculators, the custom fields and the UI extension
 */

import {
  PluginCommonModule,
  EtechPlugin,
  RuntimeEtechConfig,
  LanguageCode,
} from "@etech/core";
import ProductVariantCustomFields from "./custom-fields";
import path from "path";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import { valueWeightShippingEligibilityChecker } from "./checkers/valueWeightChecker";
import { flatRateShippingCalculator } from "./calculators/flatrateCalculator";
import { flightTimeBasedShippingCalculator, landDistanceBasedShippingCalculator } from "./calculators/weightCalculators";
import { ShopApiResolver } from "./api/resolver";
import { apiExtension } from "./api/api.extensions";
@EtechPlugin({
  imports: [PluginCommonModule],
  shopApiExtensions:{schema:apiExtension, resolvers:[ShopApiResolver]},
  configuration: (config) => ExtendedShipmentsPlugin.configure(config),
})
export class ExtendedShipmentsPlugin {
  constructor() {}

  static async configure(
    config: RuntimeEtechConfig
  ): Promise<RuntimeEtechConfig> {
    config.customFields.ProductVariant.push(...ProductVariantCustomFields!);
    config!.shippingOptions!.shippingEligibilityCheckers!.push(
      valueWeightShippingEligibilityChecker
    );
    // config!.shippingOptions!.shippingEligibilityCheckers!.push(orderGeoChecker);
    config!.shippingOptions!.shippingCalculators!.push(
      flightTimeBasedShippingCalculator,
      landDistanceBasedShippingCalculator,
      flatRateShippingCalculator
    );
    config.customFields.ShippingMethod.push({
      name:'supports_shipping_to_store_location',
      type: "boolean",
      defaultValue: true,
      label: [{ languageCode: LanguageCode.en, value: 'Supports Shipping to Store Location' }],
    })
    return config;
  }

  // Note: we need to point to source files, as ui extension ts files are not compiled by the plugin, but by the Angular CLI (via compile script)
  static uiExtension: AdminUiExtension = {
    extensionPath: path.join(__dirname, "./ui"),
    ngModules: [
      {
        type: "shared",
        ngModuleFileName: "geo-selector.module.ts",
        ngModuleName: "GeoSelectorModule",
      },
    ],
  };
}
