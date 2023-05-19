import { PluginCommonModule, Type, EtechPlugin } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import path from 'path';
import { readChartsPermissionDefinition } from '.';

@EtechPlugin({
    imports: [PluginCommonModule],
    configuration: config => {
        config.authOptions.customPermissions.push(readChartsPermissionDefinition);
        return config;
      }
})
export class ChartsPlugin {
    static init(): Type<ChartsPlugin> {
        // this.options = options;
        return ChartsPlugin;
    }
    

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'charts-ui-extension.module.ts',
                ngModuleName: 'ChartsUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'charts',
                ngModuleFileName: 'charts-ui-lazy.module.ts',
                ngModuleName: 'ChartsUiLazyModule',
            }
        ],
    };
}