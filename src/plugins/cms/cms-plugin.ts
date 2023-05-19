import {PluginCommonModule,Type, EtechPlugin } from '@etech/core';

import { CmsEntity } from './entities/cms.entity';
import  {CmsAsset} from "./entities/cms-asset.enitity";
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import path from 'path';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import {CmsEntityResolver} from "./api/cms-entity.resolver";
import {CmsService} from "./service/cms.service";
import {PLUGIN_INIT_OPTIONS} from "./constants";
import {PluginInitOptions} from "./types";
import {CmsAdminResolver} from "./api/cms-admin.resolver";
import { readCmsPermissionDefinition, updateCmsPermissionDefinition } from '.';

@EtechPlugin({
    imports: [PluginCommonModule],
    entities: [CmsEntity,CmsAsset],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [CmsEntityResolver,CmsAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [CmsEntityResolver],
    },
    providers: [
        CmsService,
        { provide: PLUGIN_INIT_OPTIONS, useFactory: () => CmsPlugin.options },
    ],
    configuration: config => {
        config.authOptions.customPermissions.push(readCmsPermissionDefinition, updateCmsPermissionDefinition);
        return config;
      }
})
export class CmsPlugin {
    static options: PluginInitOptions;

    /**
     * The static `init()` method is a convention used by Etech plugins which allows options
     * to be configured by the user.
     */
    static init(options: PluginInitOptions): Type<CmsPlugin> {
        this.options = options;
        return CmsPlugin;
    }
    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'cms-ui-extension.module.ts',
                ngModuleName: 'CmsUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'cms',
                ngModuleFileName: 'cms-ui-lazy.module.ts',
                ngModuleName: 'CmsUiLazyModule',
            },
        ],
    };
}
