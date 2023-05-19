import './types';
import { PluginCommonModule, EtechPlugin, EntityHydrator, ConfigService, LanguageCode} from '@etech/core';
import path from 'path';
import { CommonApiResolver } from './api/resolvers/common-api-resolvers';
import { commonApiExtension } from './api/common-api-extension';
import { AdminUiExtension } from '@etech/ui-devkit/compiler';
import { AdminApiResolver } from './api/resolvers/admin-api-resolvers';
import { adminApiExtension } from './api/admin-api-extension';
import { ProductsController } from './api/payment-controller';
import { TelebirrController } from './api/telebirr-controller';
import { InvoicePlugin } from '../invoice';
import { AddonsService } from './api/services/addons-service';
import { EthiolabOrderCodeStrategy } from './api/strategies';
import { CustomSearchService } from './api/services/custom-search.service';
import { ProductDocumentationService } from './api/services/product-documentation.service';
import { RegisterEtechCustomerService } from './api/services/register-etech-customer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ActiveOrderCancellationService } from './api/services/active-order-cancellation.service';
import { CacheModule } from '@nestjs/common';
import { EmailService } from './api/services/email.service';
import { UpdateBestSellersService } from './api/services/update-best-seller.service';
import { BestSellerEntity } from './api/entities/best-sellers.entity';
import { FetchBestSellersService } from './api/services/fetch-best-seller.service';
import { CronJobsService } from './api/services/cron.jobs.service';
import { RedisSessionCachePluginOptions, RedisSessionCacheStrategy } from './api/strategies/redis-session-cache.strategy';
import { CollectionFieldOverride } from './api/graphql-field-modifications/collection-gql-field-modifiation.resolver';
import { ProductVariantFieldModification } from './api/graphql-field-modifications/productvariant-gql-field-modifiation.resolver';
import { OrderFieldExtension } from './api/graphql-field-modifications/order-gql-field-modifiation.resolver';
import { ProductFieldModification } from './api/graphql-field-modifications/product-gql-field-modifiation.resolver';
import { OrderLineFieldModification } from './api/graphql-field-modifications/orderline-gql-field-modifiation.resolver';
import { updateAllowCustomerPaymentCustomFieldProcess } from './api/custom-order-process/adding-items.custom-order-process';
import { OrderBasedItemStockTrackingUpdater } from './api/services/order_based_item_stock_tracking_updater';
import { EthiolabOrderPlacedStrategy } from './api/strategies/ethiolab-order-placed-strategy';
import { ReflectSurchargesOnOrderService } from './api/services/order-line-price-modification.service';
import { SetSelfPickupAsShippineMethodService } from './api/services/set-self-pickup-shipping-method.service';
import { EthiolabOrderMergeStartegy } from './api/strategies/ethiolab-order-merge-strategy.service';
import { UpdateAllowCustomerPayemntService } from './api/services/update-allow-customer-payemnt-service';
@EtechPlugin({
    imports: [
        PluginCommonModule,
        InvoicePlugin, 
        ScheduleModule.forRoot(), 
        CacheModule.register({ 
            isGlobal: true,
         })
    ],
    providers: [
        EntityHydrator, 
        AddonsService, 
        ConfigService,
        CronJobsService,
        FetchBestSellersService,
        RegisterEtechCustomerService, 
        EmailService, UpdateBestSellersService,
        CustomSearchService, 
        OrderBasedItemStockTrackingUpdater,
        ReflectSurchargesOnOrderService,
        SetSelfPickupAsShippineMethodService,
        UpdateAllowCustomerPayemntService,
        ProductDocumentationService, ActiveOrderCancellationService],
    shopApiExtensions:{
        resolvers: [CommonApiResolver, CollectionFieldOverride,
            ProductVariantFieldModification, OrderFieldExtension,ProductFieldModification, OrderLineFieldModification],
        schema: commonApiExtension,
    },
    adminApiExtensions:{
        resolvers: [CommonApiResolver, AdminApiResolver, CollectionFieldOverride],
        schema: adminApiExtension,
    },
    entities:[BestSellerEntity],
    configuration: config => {
        config.customFields.Product.push(
            {
                name: 'documentations',
                type: 'string',
                list: true,
                defaultValue:[],
                length:4,
                ui: { component: 'product-doc' }
            },
            {
                name: 'granularity', 
                type: 'string', 
                options: [
                  { value: 'Piece' },
                  { value: 'Pack' },
                ],
                defaultValue:'Piece',
                label: [{ languageCode: LanguageCode.en, value: 'Granularity' }]
            },
            {name: 'youtube_link', type: 'string', defaultValue: '',
            label: [{ languageCode: LanguageCode.en, value: 'Youtube Link' }]},
            {name: 'maintenance_fee', type: 'float', defaultValue: 0,
            min:0, step:0.1, ui:{component:'currency-form-input'},
            label: [{ languageCode: LanguageCode.en, value: 'Maintenance Fee' }]},
        );
        config.customFields.Product.push({name: 'is_order_based', type: 'boolean', defaultValue: false,
        label: [{ languageCode: LanguageCode.en, value: 'is Ordered Based' }],})
        config.customFields.ProductVariant.push(
            {
                name: 'description',
                type: 'text',
                nullable: true,
                ui: { component: 'rich-text-editor' }
            },
            {
                name: 'table',
                type: 'text',
                nullable: true,
                ui: { component: 'rich-text-editor' }
            },
            {
                name: "accessories", 
                type: "string",
                nullable: true,
                ui: { component: 'accessories' },
                defaultValue: ""
            },
            {
                name: "dimensions", 
                type: 'text',
                nullable: true,
                label: [{ languageCode: LanguageCode.en, value: 'Dimensions' }],
                ui: { component: 'dimensions' },
                defaultValue: null,
            },
            {name: 'additional_shipping_cost', type: 'float', defaultValue: 0,
            min:0, step:0.1, ui:{component:'currency-form-input'},
            label: [{ languageCode: LanguageCode.en, value: 'Additional Shipping Cost' }]},
        );
        config.customFields.Administrator.push(
            { name: 'uses2fa', type: 'boolean', defaultValue: false,
            label: [{ languageCode: LanguageCode.en, value: '2FA enabled' }],},
            { name: 'refunds', type: 'string', defaultValue: "", internal: true},
            { name: 'phone_number',type: 'string', ui: { component: 'admin-phone-field',
            label: [{ languageCode: LanguageCode.en, value: 'Phone Number' }], }},
            { name: 'signature',type: 'string', ui: { component: 'admin-signature-field' }, defaultValue: ""},
            { name: 'fulfillments',type: 'string', ui: { component: 'admin-fulfillment-field' }, defaultValue: ""},
        )
        config.customFields.Address.push(
            { name: 'fax', type: 'string', defaultValue: null},
        )
        config.customFields.Customer.push(
            { name: 'job', type: 'string', defaultValue: null},
            { 
                name: "tin_number", 
                type: "string", 
                defaultValue: "",
                label: [{ languageCode: LanguageCode.en, value: 'Tin number' }], 
            },
        )
        config.customFields.GlobalSettings.push({ 
            name: 'cancel_order_after', 
            type: "float", 
            nullable:false, defaultValue:0, 
            ui: { component: 'cancel-order-after' },
            label: [{ languageCode: LanguageCode.en, value: 'Cancel Orders After' },],
        },
        { 
            name: 'update_best_sellers_every', 
            type: "float", nullable:false, 
            defaultValue:0 , ui: { component: 'update-best-sellers-every' },
            label: [{ languageCode: LanguageCode.en, value: 'Update Best Sellers Every' }],
        })
        config.customFields.Order.push({
            name: "allow_customer_payment", 
            type: "boolean", defaultValue: true, 
            ui: { component: 'allow-customer-payment' },
            label: [{ languageCode: LanguageCode.en, value: 'Allow Customer Payment' }],
        }
        )
        config.authOptions.sessionCacheStrategy = new RedisSessionCacheStrategy(
            AddonsPlugin.options,
          );
        // config.orderOptions.process.push(updateAllowCustomerPaymentCustomFieldProcess);
        config.orderOptions.orderCodeStrategy= new EthiolabOrderCodeStrategy();
        config.orderOptions.orderPlacedStrategy= new EthiolabOrderPlacedStrategy();
        config.orderOptions.mergeStrategy=new EthiolabOrderMergeStartegy();
        config.apiOptions.adminEndpointLockoutTime='1m';
        config.apiOptions.adminMaxTryAllowedBeforeEndpointLockout=5;
        return config;
     },
     controllers: [ProductsController,TelebirrController],
     exports:[EmailService,ReflectSurchargesOnOrderService]
})
export class AddonsPlugin{
    static options: RedisSessionCachePluginOptions;
    static init(options: RedisSessionCachePluginOptions) {
        this.options = options;
        return this;
    }
    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'shared-extension.module.ts',
                ngModuleName: 'AddonsSharedExtensionModule',
            },
        ],
    };
}