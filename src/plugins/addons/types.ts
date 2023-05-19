import { Product } from '@etech/core';
import { CustomCustomerFields, CustomAddressFields, CustomProductFields, CustomProductVariantFields,
  CustomAdministratorFields, CustomGlobalSettingsFields, CustomOrderFields, CustomShippingMethodFields } from '@etech/core/dist/entity/custom-entity-fields';
import { ProductBrand } from '../brands/api/entities/brand-entity';
import { ProductIndustry } from '../brands/api/entities/industry-entity';
import { StockChangeLog } from '../stock-timeline/api/stock-change-log.entity';
import { ProductReview } from './generated-shop-types';

declare module '@etech/core/dist/entity/custom-entity-fields' {
  interface CustomCustomerFields {
    job: string;
    tin_number: boolean;
  }

  interface CustomGlobalSettingsFields {
    cancel_order_after: number;
    update_best_sellers_every: number;
  }

  interface CustomAddressFields {
    fax: string;
  }

  interface CustomAdministratorFields {
    uses2fa: boolean;
    refunds: string;
    phone_number: string;
    fulfillments: string;
    signature: string;
  }

  interface CustomProductFields{
    youtube_link: string;
    brand: ProductBrand;
    industries: ProductIndustry[];
    accessories: string;
    documentation:string;
    maintenance_fee:string;
    reviewRating: number;
    reviewCount: number;
    featuredReview?: ProductReview;
    is_order_based: boolean;
  }

  interface CustomProductVariantFields{
    description: string;
    table: string;
    accessories: string;
    weight: number;
    weightUoM: string;
    dimensions: string;
    additional_shipping_cost: number;
    stockTimeline: StockChangeLog[];
  }

  interface CustomGlobalSettingsFields{
    cancel_order_after: number;
  }

  interface CustomOrderFields{
    allow_customer_payment: boolean;
  }
  interface CustomShippingMethodFields{
    supports_shipping_to_store_location: boolean;
  }
}