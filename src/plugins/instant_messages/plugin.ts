import { EtechPlugin, PluginCommonModule } from "@etech/core";
import { InstantMessage } from "./api/instant-message.entity";
import { InstantMessageService } from "./api/instant-message.service";
import {shopApiExtensions, adminApiExtension} from './api/api-extensions';
import { AdminApiResolver } from "./api/admin.resolver";
import path from 'path'
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import { ShopApiResolver } from "./api/shop.resolver";
@EtechPlugin({
    imports: [PluginCommonModule],
    entities: [InstantMessage],
    providers: [InstantMessageService],
    shopApiExtensions:{
        schema: shopApiExtensions,
        resolvers: [ShopApiResolver]
    },
    adminApiExtensions:{
        schema: adminApiExtension,
        resolvers: [AdminApiResolver]
    }
})
export class InstantMessagePlugin{
    public static uiExtensions: AdminUiExtension = {
    
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'nav.module.ts',
                ngModuleName: 'InstantMessagesNavSharedModule',
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
             route: 'instantmessages',
                 ngModuleFileName: 'page.module.ts',
                 ngModuleName: 'InstantMessagesPageModule',
             }
        ],
    };
}