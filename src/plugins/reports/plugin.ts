import { PluginCommonModule, Type, EtechPlugin } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import path from 'path';
// import { AddonsPlugin } from '../addons/plugin';
import {adminApiExtension} from './api/api.extension';
import { createStockReportPermission,createSalesReportPermission,createRefundReportPermission } from './api/permissions';
import { RefundReportService } from './api/services/refund-admin-api.service';
import {ReportApiResolver} from './api/resolvers';
import { SalesReportService } from './api/services/sales-admin-api.service';
import { StockReportService } from './api/services/stock-admin-api.service';


@EtechPlugin({
    imports: [PluginCommonModule, /*AddonsPlugin*/],
    providers:[RefundReportService,SalesReportService,StockReportService],
    adminApiExtensions: {
        schema: adminApiExtension, 
        resolvers: [ReportApiResolver]
    },
    configuration: config => {
        config.authOptions.customPermissions.push(createStockReportPermission,
            createSalesReportPermission, createRefundReportPermission);
        return config;
    }
})
export class ReportsPlugin {
    static init(): Type<ReportsPlugin> {
        // this.options = options;
        return ReportsPlugin;
    }

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'reports-ui-extension.module.ts',
                ngModuleName: 'ReportsUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'reports',
                ngModuleFileName: 'reports-ui-lazy.module.ts',
                ngModuleName: 'ReportsUiLazyModule',
            }
        ],
    };
}