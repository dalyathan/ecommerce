import {
  PluginCommonModule,
  RuntimeEtechConfig,
  Type,
  EtechPlugin,
} from '@etech/core';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import path from 'path';
import { InvoiceConfigEntity } from './api/entities/invoice-config.entity';
import { InvoiceEntity } from './api/entities/invoice.entity';
import { InvoiceController } from './api/invoice.controller';
import { InvoiceAdminApiResolver } from './api/invoice.admin.resolver';
import { InvoiceService } from './api/invoice.service';
import { schema } from './api/schema.graphql';
import { DataStrategy } from './api/strategies/data-strategy';
import { DefaultDataStrategy } from './api/strategies/default-data-strategy';
import { LocalFileStrategy } from './api/strategies/local-file-strategy';
import { PLUGIN_INIT_OPTIONS } from './constants';
import { invoicePermission, StorageStrategy } from './index';
import { InvoiceShopApiResolver } from './api/invoice.shop.resolver';
import { ReflectSurchargesOnOrderService } from '../addons/api/services/order-line-price-modification.service';
import { AddonsPlugin } from '../addons/plugin';

export interface InvoicePluginConfig {
  /**
   * Hostname to use for download links, can be the Etech instance,
   * but also the worker instance if you want
   */
  etechHost: string;
  dataStrategy: DataStrategy;
  storageStrategy: StorageStrategy;
}

@EtechPlugin({
  imports: [PluginCommonModule],
  entities: [InvoiceConfigEntity, InvoiceEntity],
  providers: [
    InvoiceService,
    ReflectSurchargesOnOrderService,
    { provide: PLUGIN_INIT_OPTIONS, useFactory: () => InvoicePlugin.config },
  ],
  controllers: [InvoiceController],
  adminApiExtensions: {
    schema,
    resolvers: [InvoiceAdminApiResolver],
  },
  shopApiExtensions: {
    schema,
    resolvers: [InvoiceShopApiResolver],
  },
  exports: [InvoiceService],
  configuration: (config) => InvoicePlugin.configure(config),
})
export class InvoicePlugin {
  static config: InvoicePluginConfig;

  static init(
    config: Partial<InvoicePluginConfig> & { etechHost: string }
  ): Type<InvoicePlugin> {
    InvoicePlugin.config = {
      ...config,
      storageStrategy: config.storageStrategy || new LocalFileStrategy(),
      dataStrategy: config.dataStrategy || new DefaultDataStrategy(),
    };
    return this;
  }

  static async configure(config: RuntimeEtechConfig) {
    config.authOptions.customPermissions.push(invoicePermission);
    if (this.config.storageStrategy) {
      await this.config.storageStrategy.init();
    }
    return config;
  }

  static ui: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'lazy',
        route: 'invoices',
        ngModuleFileName: 'invoices.module.ts',
        ngModuleName: 'InvoicesModule',
      },
      {
        type: 'shared',
        ngModuleFileName: 'invoices-nav.module.ts',
        ngModuleName: 'InvoicesNavModule',
      },
    ],
  };
}
