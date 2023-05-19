import { EtechPlugin, PluginCommonModule } from "@etech/core";
import { CompanyInfo } from "./company.model";
import { CompanyResolver } from "./company.resolver";
import path from 'path';
import extensions from './company.extension';
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import {CompanyService} from './company.service'
import { readCompanyInfoPermissionDefinition, updateCompanyInfoPermissionDefinition } from ".";

@EtechPlugin({
    imports: [PluginCommonModule],
    providers: [CompanyService],
    entities: [CompanyInfo],
    adminApiExtensions:
        {resolvers: [CompanyResolver], schema: extensions},
    shopApiExtensions: {resolvers: [CompanyResolver], schema: extensions},
    configuration: config => {
        config.authOptions.customPermissions.push(readCompanyInfoPermissionDefinition, updateCompanyInfoPermissionDefinition);
        return config;
      }
    
})
export class CompanyInfoPlugin{
    public static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'nav.module.ts',
                ngModuleName: 'CompanyInfoSharedModule',
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
             route: 'company_info',
                 ngModuleFileName: 'page.module.ts',
                 ngModuleName: 'CompanyInfoPageModule',
             }
        ],
    };
}