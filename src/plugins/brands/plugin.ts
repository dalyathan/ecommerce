// import './types';
import { PluginCommonModule, EtechPlugin, CrudPermissionDefinition } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import path from 'path';
import { adminApiExtension, commonApiExtension } from './api/api-extension';
import  BrandAdminApiResolver  from './api/resolvers/brand-admin-resolver';
import  IndustryAdminApiResolver  from './api/resolvers/industry-admin-resolver';

import  BrandCommonApiResolver  from './api/resolvers/brand-common-resolver';
import IndustryCommonApiResolver from './api/resolvers/industry-common-resolver';

import { ProductBrand } from './api/entities/brand-entity';
import  BrandService  from './api/services/brand-service';
import  IndustryService  from './api/services/industry-service';
import { ProductIndustry } from './api/entities/industry-entity';
import { brandsPermission, industryPermission } from '.';

@EtechPlugin({
    imports: [PluginCommonModule],
    providers: [BrandService,IndustryService],
    entities: [ProductBrand,ProductIndustry],
    configuration: config => {
        config.customFields.Product.push(
            {
                name: 'brand',
                type: 'relation',
                entity: ProductBrand,
                graphQLType: "BrandType", 
                nullable: true,
                eager: false,
                ui: { component: 'choose-brand' }
            },
            {
                name: 'industries',
                type: 'relation',
                list: true,
                entity: ProductIndustry,
                graphQLType: "IndustryType", 
                defaultValue: [],
                nullable: false,
                eager: false,
                ui: { component: 'choose-industry' }
            }
        );
        config.authOptions.customPermissions.push(brandsPermission,industryPermission);
        return config;
     },
    adminApiExtensions: {
        schema: adminApiExtension,
        resolvers: [BrandAdminApiResolver,IndustryAdminApiResolver,
                BrandCommonApiResolver,IndustryCommonApiResolver],
    },
    shopApiExtensions: {
        schema: commonApiExtension,
        resolvers: [BrandCommonApiResolver,IndustryCommonApiResolver],
    },
})
export class BrandsPlugin {

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname,'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'brands-ui-extension.module.ts',
                ngModuleName: 'BrandsUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'catalog',
                ngModuleFileName: 'brands-ui-lazy.module.ts',
                ngModuleName: 'BrandsUiLazyModule',
            }
        ],
    };
}