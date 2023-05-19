import { CrudPermissionDefinition, EtechPlugin,PluginCommonModule } from "@etech/core";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import path from 'path';
import PriceList from './api/price-list.entity';
import { adminApiExtension } from "./api/api.extension";
import { ApiResolver } from "./api/price-list.resolver";
import { EtechProductVariantPriceCalculationStrategy } from "./api/etech-variant-price.calculation.strategy";
import { createPriceListsPermissionDefinition, deletePriceListsPermissionDefinition, readPriceListsPermissionDefinition, updatePriceListsPermissionDefinition } from ".";
import { PriceListService } from "./api/price-list.service";

@EtechPlugin({
    imports: [PluginCommonModule],
    entities: [PriceList],
    providers:[PriceListService],
    adminApiExtensions: {
        schema: adminApiExtension,
        resolvers: [ApiResolver]
    },
    configuration: config => {
        config.catalogOptions.productVariantPriceCalculationStrategy= new EtechProductVariantPriceCalculationStrategy();
        config.authOptions.customPermissions.push(new CrudPermissionDefinition('PriceLists',
        operation=>`Grants Permission to PriceLists`));
        return config;
    }
})
export class PriceListPlugin{
    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, ''),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'price-list.ui-extension.module.ts',
                ngModuleName: 'PriceListUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'customers',
                ngModuleFileName: 'price-list.ui-lazy.module.ts',
                ngModuleName: 'PriceListUiLazyModule',
            }
        ],
    };
}