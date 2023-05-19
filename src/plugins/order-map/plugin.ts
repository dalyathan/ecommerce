import { CrudPermissionDefinition, EtechPlugin,PluginCommonModule } from "@etech/core";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import path from 'path';
import { OrderPlacedAtEventListener } from "./api/order-places-event.listener";
import { SessionData } from "./api/session.data.entity";
@EtechPlugin({
    imports: [PluginCommonModule],
    entities:[SessionData],
    providers:[OrderPlacedAtEventListener]
})
export class OrderMapPlugin{
    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, ''),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'order-map.ui-extension.module.ts',
                ngModuleName: 'OrderMapUiExtensionModule',
            },
            // {
            //     type: 'lazy' as const,
            //     route: 'customers',
            //     ngModuleFileName: 'order-map.lazy.module.ts',
            //     ngModuleName: 'OrderMapLazyModule',
            // }
        ],
    };
}