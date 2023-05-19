import { PluginCommonModule, EtechPlugin, ProductService } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';

import path from 'path';
import { updateQuotesPermissionDefinition, deleteQuotePermissionDefinition, readQuotesPermissionDefinition } from './api';
import { quoteAdminApiExtensions, quoteShopApiExtensions } from './api/q-api-extensions';
import { QuoteService } from './api/qoute_service';
import { QuoteAdminResolver } from './api/quote.admin.resolver';
import { Quote } from './api/quote_entity';
import { CompanyInfoPlugin } from '../company-info/plugin';
import {CompanyService} from '../company-info/company.service';
import {CmsEntityResolver} from '../cms/api/cms-entity.resolver';
import { CmsPlugin } from '../cms/cms-plugin';
import { EmailService } from '../addons/api/services/email.service';
import { QuoteShopResolver } from './api/quote.shop.resolver';
import { QuoteAccessAuthorizationMiddleware } from './api/quote-access-authorisation.middleware';
@EtechPlugin({
 imports: [PluginCommonModule, CompanyInfoPlugin, CmsPlugin],
    providers: [QuoteService,ProductService, CompanyService, CmsEntityResolver,EmailService],
    entities:[
       Quote 
    ],
    configuration: config => {
        config.authOptions.customPermissions.push(readQuotesPermissionDefinition,
            deleteQuotePermissionDefinition, updateQuotesPermissionDefinition);
        config.apiOptions.middleware.push({handler: QuoteAccessAuthorizationMiddleware.prototype.use,
          route: '/assets/quotes'})
        return config;
    },
    shopApiExtensions: {
         schema: quoteShopApiExtensions,
        resolvers: [QuoteShopResolver],
    },
    adminApiExtensions: {
      schema: quoteAdminApiExtensions,
     resolvers: [QuoteAdminResolver],
 },
 
    
})
export class QuotePlugin {
   public static uiExtensions: AdminUiExtension = {
      extensionPath: path.join(__dirname, 'ui'),
      
      ngModules: [
          {
              type: 'shared' as const,
              ngModuleFileName: 'nav.module.ts',
              ngModuleName: 'NavSharedModule',
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
              route: 'quotes',
              ngModuleFileName: 'page.module.ts',
              ngModuleName: 'PageModule',
          }
      ],
  };
}