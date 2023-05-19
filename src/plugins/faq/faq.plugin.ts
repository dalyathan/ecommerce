import { EtechPlugin, PluginCommonModule } from "@etech/core";
import { Faq } from "./faq.model";
import { FaqAdminResolver } from "./faq.resolver.admin";
import path from 'path';
import {adminApiExtension,shopApiExtension} from './faq.extension';
import { FaqService } from "./faq.service";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import { createFAQsPermissionDefinition, deleteFAQsPermissionDefinition, 
    readFAQsPermissionDefinition, updateFAQsPermissionDefinition } from ".";
import { FaqShopResolver } from "./faq.resolver.shop";

@EtechPlugin({
    imports: [PluginCommonModule],
    providers: [FaqService],
    entities: [Faq],
    adminApiExtensions:
        {resolvers: [FaqAdminResolver], schema: adminApiExtension},
    shopApiExtensions: {resolvers: [FaqShopResolver], schema: shopApiExtension},
    configuration: config => {
        config.authOptions.customPermissions.push(readFAQsPermissionDefinition,createFAQsPermissionDefinition,
            deleteFAQsPermissionDefinition,updateFAQsPermissionDefinition);
        return config;
      }
})
export class FaqPlugin{
    public static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'nav.module.ts',
                ngModuleName: 'FaqNavSharedModule',
            },
            // {
            //     type: 'lazy' as const,
            //     route: 'sales-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
            // {
            //     type: 'lazy' as const,
            //     route: 'customized-sales-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
            // {
            //     type: 'lazy' as const,
            //     route: 'stock-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
             {
             type: 'lazy' as const,
             route: 'faqs',
                 ngModuleFileName: 'page.module.ts',
                 ngModuleName: 'FaqPageModule',
             }
        ],
    };
}