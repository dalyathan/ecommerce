import { PluginCommonModule, Type, EtechPlugin } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import path from 'path';
import { createBulkUploadPermissionDefinition } from '.';
import { BulkUploadAdminResolver } from './api/resolvers/bulk-upload-admin.resolver';
import {adminApiExtension} from './api/admin.api.extension';
import { BulkUploadInitService } from './api/services/bulk-upload-init.service';
@EtechPlugin({
    imports: [PluginCommonModule],
    providers:[BulkUploadInitService],
    adminApiExtensions:{
        schema: adminApiExtension,
        resolvers:[BulkUploadAdminResolver]
    },
    configuration: config => {
        config.authOptions.customPermissions.push(createBulkUploadPermissionDefinition);
        return config;
      }

})
export class BulkUploadPlugin {
    static init(): Type<BulkUploadPlugin> {
        // this.options = options;
        return BulkUploadPlugin;
    }

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'bulk-upload-ui-extension.module.ts',
                ngModuleName: 'BulkUploadUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'catalog',
                ngModuleFileName: 'bulk-upload-ui-lazy.module.ts',
                ngModuleName: 'BulkUploadUiLazyModule',
            }
        ],
    };
}