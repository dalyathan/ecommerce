import {  PluginCommonModule, EtechPlugin } from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';

import path from 'path';
import { apiExtension } from './api/admin-api.extension';
import { ProductRelatedActivityLogEntity } from './api/entities/product-related-activity-log.entity';
import { ProductRelatedActivityLogResolver } from './api/resolvers/product-related-activity-log.resolvers';
import { ProductRelatedActivityLogService } from './api/services/product-related-activity-log.service';
import { OrderRelatedActivityLogEntity } from './api/entities/order-related-activity-log.entity';
import { OrderRelatedActivityLogService } from './api/services/order-related-activity-log.service';
import { OrderRelatedActivityLogResolver } from './api/resolvers/order-related-activity-log.resolvers';
import { CollectionActivityLogEntity } from './api/entities/collection-activity-log.entity';
import { CollectionActivityLogService } from './api/services/collection-activity-log.service';
import { CollectionActivityLogResolver } from './api/resolvers/collection-activity-log.resolvers';
import { IndustryActivityLogEntity } from './api/entities/industry-activity-log.entity';
import { IndustryActivityLogService } from './api/services/industry-activity-log.service';
import { IndustryActivityLogResolver } from './api/resolvers/industry-activity-log.resolvers';
import { BrandActivityLogEntity } from './api/entities/brand-activity-log.entity';
import { BrandActivityLogService } from './api/services/brand-activity-log.service';
import { BrandActivityLogResolver } from './api/resolvers/brand-activity-log.resolvers';
import { ShippingMethodActivityLogEntity } from './api/entities/shipping-method-activity-log.entity';
import { ShippingMethodActivityLogService } from './api/services/shipping-method-activity-log.service';
import { ShippingMethodActivityLogResolver } from './api/resolvers/shipping-method-activity-log.resolvers';
import { PaymentMethodActivityLogEntity } from './api/entities/payment-method-activity-log.entity';
import { PaymentMethodActivityLogService } from './api/services/payment-method-activity-log.service';
import { PaymentMethodActivityLogResolver } from './api/resolvers/payment-method-activity-log.resolvers';
import { CustomerRelatedActivityLogResolver } from './api/resolvers/customer-related-activity-log.resolvers';
import { CustomerRelatedActivityLogService } from './api/services/customer-related-activity-log.service';
import { CustomerRelatedActivityLogEntity } from './api/entities/customer-related-activity-log.entity';
import { PriceListActivityLogService } from './api/services/price-list-activity-log.service';
import { PriceListActivityLogResolver } from './api/resolvers/price-list-activity-log.resolvers';
import { PriceListActivityLogEntity } from './api/entities/price-list-activity-log.entity';
import { activityLogsPermission } from './permission';


@EtechPlugin({
 imports: [PluginCommonModule],
    providers: [ProductRelatedActivityLogService, OrderRelatedActivityLogService, ShippingMethodActivityLogService,
        CollectionActivityLogService,IndustryActivityLogService, BrandActivityLogService,
        PaymentMethodActivityLogService, CustomerRelatedActivityLogService, PriceListActivityLogService],
    entities:[
        ProductRelatedActivityLogEntity,
        OrderRelatedActivityLogEntity,
        CollectionActivityLogEntity,
        IndustryActivityLogEntity,
        BrandActivityLogEntity,
        ShippingMethodActivityLogEntity,
        PaymentMethodActivityLogEntity,
        CustomerRelatedActivityLogEntity,
        PriceListActivityLogEntity
    ],
    configuration: config => {
        config.authOptions.customPermissions.push(activityLogsPermission);
        return config;
    },
    // shopApiExtensions: {
    //      schema: ,
    //     resolvers: [],
    // },
    adminApiExtensions: {
        schema: apiExtension,
        resolvers: [ProductRelatedActivityLogResolver, OrderRelatedActivityLogResolver, BrandActivityLogResolver,
            CollectionActivityLogResolver, IndustryActivityLogResolver,ShippingMethodActivityLogResolver,
            PaymentMethodActivityLogResolver,CustomerRelatedActivityLogResolver, PriceListActivityLogResolver],
    },
})
export class ActivityLogPlugin {
   public static uiExtensions: AdminUiExtension = {
      extensionPath: path.join(__dirname),
      
      ngModules: [
          {
              type: 'shared' as const,
              ngModuleFileName: 'activity-log.ui-extension.module.ts',
              ngModuleName: 'ActivityLogUiExtensionModule',
          },
          {
              type: 'lazy' as const,
              route: 'activity-logs',
              ngModuleFileName: 'activity-log.ui-lazy.module.ts',
              ngModuleName: 'ActivityLogUiLazyModule',
          }
      ],
  };
}