import { EtechPlugin, PluginCommonModule } from "@etech/core";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import { contactUsApiExtensions } from "./api/api_extensions";
import { ContactUsMessage } from "./api/entity";
import { ContactUsResolver } from "./api/resolver";
import { ContactUsService } from "./api/service";
import path from 'path'
import { contactUsPermissionDefinition } from ".";
import { EmailService } from "../addons/api/services/email.service";

@EtechPlugin({
    imports: [PluginCommonModule],
    entities: [ContactUsMessage],
    providers: [ContactUsService, EmailService],
    shopApiExtensions: {
        resolvers: [ContactUsResolver],
        schema: contactUsApiExtensions
    },
    adminApiExtensions: {
        resolvers: [ContactUsResolver],
        schema: contactUsApiExtensions
    },
    configuration: config => {
        config.authOptions.customPermissions.push(contactUsPermissionDefinition);
        return config;
    }
})
export class ContactUsPlugin{
    public static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'nav.module.ts',
                ngModuleName: 'ContactUsNavSharedModule',
            },
            {
                type: 'lazy' as const,
                route: 'contactus',
                ngModuleFileName: 'page.module.ts',
                ngModuleName: 'ContactUsPageModule',
            }
        ],
    };
}