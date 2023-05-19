import { PluginCommonModule, EtechPlugin, LanguageCode } from "@etech/core";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import path from 'path';
import { StockChangeLog } from "./api/stock-change-log.entity";
import {adminApiExtension} from './api/api-extensions';
import {AdminApiResolver} from './api/resolver.api';
import { StockChangeLogService } from "./api/services/stock-change.service";
export interface ExampleOptions {
  enabled: boolean;
}

@EtechPlugin({
  imports: [PluginCommonModule],
  entities:[StockChangeLog],
  providers:[StockChangeLogService],
  adminApiExtensions:{schema:adminApiExtension, resolvers:[AdminApiResolver]},
  configuration: (config) => {
    config.customFields.ProductVariant.push({
      name: 'stockTimeline', 
      public: false,
      type:'relation',
      entity: StockChangeLog,
      list: true,
      graphQLType: 'StockChangeLog',
      ui: { component: 'stock-timeline' },
      label: [{ languageCode: LanguageCode.en, value: 'Stock History' }]})
      return config;
    },
  },
)
export class StockTimelinePlugin {
  static options: ExampleOptions;

  static init(options: ExampleOptions) {
    this.options = options;
    return StockTimelinePlugin;
  }
  static uiExtensions: AdminUiExtension = {
      extensionPath: path.join(__dirname, 'ui'),
      
      ngModules: [
          {
              type: 'shared' as const,
              ngModuleFileName: 'ui-extension.module.ts',
              ngModuleName: 'StockTimelineExtensionModule',
          },
      ],
  };
}