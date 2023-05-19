import { InvoicePlugin } from "./plugins/invoice/invoice.plugin";
import { ReviewsPlugin } from "./plugins/reviews/reviews-plugin";
import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  EtechConfig,
  UuidIdStrategy
} from "@etech/core";
import { defaultEmailHandlers, EmailPlugin } from "@etech/email-plugin";
import { AssetServerPlugin } from "@etech/asset-server-plugin";
import { AdminUiPlugin } from "@etech/admin-ui-plugin";
import path from "path";
import { CmsPlugin } from "./plugins/cms/cms-plugin";
import { QuotePlugin } from "./plugins/quote/quote-plugin";
import { ReportsPlugin } from "./plugins/reports/plugin";
import { compileUiExtensions } from "@etech/ui-devkit/compiler";
import { SubscriptionPlugin } from "./plugins/subscription/plugin";
import { BulkUploadPlugin } from "./plugins/bulk-upload/plugin";
import { ContactUsPlugin } from "./plugins/contact-us/plugin";
import { ChartsPlugin } from "./plugins/charts/plugin";
import { SocialLoginPlugin } from "./plugins/social-login/plugin";
import { FaqPlugin } from "./plugins/faq/faq.plugin";
import { BrandsPlugin } from "./plugins/brands/plugin";
import { AddonsPlugin } from "./plugins/addons/plugin";
import { PriceListPlugin } from "./plugins/price-list/plugin";
import {TestimonialPlugin} from './plugins/testimonials/testimonails.plugin';
import { CompanyInfoPlugin } from "./plugins/company-info/plugin";
import { ExtendedShipmentsPlugin } from "./plugins/shipment";
import { MetricsPlugin } from "./plugins/metrics";
import { ActivityLogPlugin } from "./plugins/activity-log/plugin";
import { InstantMessagePlugin } from "./plugins/instant_messages/plugin";
import { HardenPlugin } from "./plugins/harden-plugin";
import { BullMQJobQueuePlugin } from '@etech/job-queue-plugin/package/bullmq';
import 'dotenv/config';
import { StockTimelinePlugin } from "./plugins/stock-timeline/plugin";
const IS_DEV = process.env.APP_ENV === 'dev';
const applyRateLimitingGlobally=false;
export const config: EtechConfig = {
  // entityOptions: {
  //   entityIdStrategy: new UuidIdStrategy(),
  // },
  apiOptions: {
    port: 3000,
    adminApiPath: "admin-api",
    adminApiPlayground: IS_DEV, // turn this off for production
    adminApiDebug: IS_DEV, // turn this off for production
    shopApiPath: "shop-api",
    shopApiPlayground: IS_DEV, // turn this off for production
    shopApiDebug: IS_DEV, // turn this off for production
    introspection: IS_DEV,
    rateLimtingExemptedEndpoints:[
      {apiType: 'admin', operation: 'query', operationName: 'GetLastNotification'},
      {apiType: 'admin', operation: 'query', operationName: 'GetAllInstantMessages'},
      {apiType: 'admin', operation: 'query', operationName: 'GetAllJobs'}
    ],
    adminEndpointLockoutTime:'1m',
    adminMaxTryAllowedBeforeEndpointLockout:5,
    shopEndpointLockoutTime: '1m',
    shopMaxTryAllowedBeforeEndpointLockout: 20,
    applyRateLimitingGlobally: applyRateLimitingGlobally,
  },
  authOptions: {
    superadminCredentials: {
      identifier: "superadmin",
      password: "superadmin",
    },
    tokenMethod: "bearer", // authorization header method
    requireVerification: false, // disable register by email verification
    cookieOptions: {
      secret: process.env.COOKIE_SECRET || "cookie-secret",
      httpOnly: true,
      sameSite: true,
      secure: true,
      secureProxy: true,
    },
  },
  dbConnectionOptions: {
    type: "mariadb",
    synchronize: false, // turn this off for production
    logging: false,
    database: process.env.ECOMMERCE_DB_NAME,
    host: process.env.ECOMMERCE_DB_HOST,
    port: +process.env.ECOMMERCE_DB_PORT,
    username: process.env.ECOMMERCE_DB_USER,
    password: process.env.ECOMMERCE_DB_PASS,
    migrations: [path.join(__dirname, "../migrations/*.ts")],
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  assetOptions:{
    uploadMaxFileSize: 30000000
  },
  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../static/assets"),
    }),
    // HardenPlugin.init({
    //   maxQueryComplexity: 100000,
    //   apiMode: IS_DEV?'dev':'prod',
    //   logComplexityScore: applyRateLimitingGlobally,
    // }),
    BullMQJobQueuePlugin.init({
      connection: {
        port: 6379
      }
    }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    // EmailPlugin.init({
    //   devMode: true,
    //   outputPath: path.join(__dirname, "../static/email/test-emails"),
    //   route: "mailbox",
    //   handlers: defaultEmailHandlers,
    //   templatePath: path.join(__dirname, "../static/email/templates"),
    //   globalTemplateVars: {
    //     // The following variables will change depending on your storefront implementation
    //     fromAddress: '"example" <noreply@example.com>',
    //     verifyEmailAddressUrl: "http://localhost:8080/verify",
    //     passwordResetUrl: "http://localhost:8080/password-reset",
    //     changeEmailAddressUrl:
    //       "http://localhost:8080/verify-email-address-change",
    //   },
    // }),
    InvoicePlugin.init({
      etechHost: process.env.ECOMMERCE_SERVER_NAME,
    }),
    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      //  app: {
      //      path: path.join(__dirname, './admin-ui/dist/'),
      // },
      app: compileUiExtensions({
        outputPath: path.join(__dirname, "admin-ui"),
        extensions: [
         ReviewsPlugin.uiExtensions,
         ReportsPlugin.uiExtensions,
         InvoicePlugin.ui,
          CmsPlugin.uiExtensions,
         SubscriptionPlugin.uiExtensions,
          QuotePlugin.uiExtensions,
          ContactUsPlugin.uiExtensions,
          BulkUploadPlugin.uiExtensions,
          FaqPlugin.uiExtensions,
          BrandsPlugin.uiExtensions,
          CompanyInfoPlugin.uiExtensions,
          AddonsPlugin.uiExtensions,
          PriceListPlugin.uiExtensions,
          ExtendedShipmentsPlugin.uiExtension,
          TestimonialPlugin.uiExtensions,
          ActivityLogPlugin.uiExtensions,
          MetricsPlugin.ui,
          ChartsPlugin.uiExtensions,
          StockTimelinePlugin.uiExtensions,
          InstantMessagePlugin.uiExtensions
        ],
        devMode: true,
      }),
    }),
    QuotePlugin,
    ReviewsPlugin,
    ContactUsPlugin,
    ReportsPlugin,
    TestimonialPlugin,
    CmsPlugin,
    StockTimelinePlugin,
    // MetricsPlugin,
    MetricsPlugin,
    SubscriptionPlugin,
    BulkUploadPlugin,
    SocialLoginPlugin,
    ChartsPlugin,
    FaqPlugin,
    BrandsPlugin,
    CompanyInfoPlugin,
    AddonsPlugin,
    PriceListPlugin,
    ExtendedShipmentsPlugin,
    ActivityLogPlugin,
    InstantMessagePlugin,
    ChartsPlugin
  ],
};
