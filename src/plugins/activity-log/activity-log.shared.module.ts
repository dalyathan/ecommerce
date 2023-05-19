import { NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import {ProductRelatedActivityLogListComponent} from './ui/components/product-related-activity-log/product-related-activity-log-list.component';
import {OrderRelatedActivityLogListComponent} from './ui/components/order-related-activity-log/order-related-activity-log-list.component';
import {ProductChangesCompareComponent} from './ui/components/product-related-activity-log/product-changes-compare.component';
import {CollectionActivityLogListComponent} from './ui/components/collection-activity-log/collection-activity-log-list.component';
import {ActivityLogListComponent} from './ui/components/activity-log-list/activity-log-list.component';
import {IndustryActivityLogListComponent,} from './ui/components/industry-activity-log/industry-activity-log-list.component';
import {BrandActivityLogListComponent,} from './ui/components/brand-activity-log/brand-activity-log-list.component';
import {ShippingMethodActivityLogListComponent} from './ui/components/shipping-method-activity-log/shipping-method-activity-log-list.component';
import {PaymentMethodActivityLogListComponent} from './ui/components/payment-method-activity-log/payment-method-activity-log-list.component';
import {CustomerRelatedActivityLogListComponent} from './ui/components/customer-related-activity-log/customer-related-activity-log-list.component';
import {PriceListActivityLogListComponent} from './ui/components/price-list-activity-log/price-list-activity-log-list.component';
import {SelectMultiAdminDialogComponent} from './ui/components/select-multi-admin-dialog/select-multi-admin-dialog.component';
import {ActivityLogFilterComponent} from './ui/components/activity-log-filter/activity-log-filter.component';
import {AdminListComponent} from './ui/components/admin-list/admin-list.component';
@NgModule({
  imports: [SharedModule],
  declarations: [ ProductRelatedActivityLogListComponent, AdminListComponent,
    CustomerRelatedActivityLogListComponent, SelectMultiAdminDialogComponent, ActivityLogFilterComponent,
    OrderRelatedActivityLogListComponent,BrandActivityLogListComponent,
    ActivityLogListComponent, ProductChangesCompareComponent, IndustryActivityLogListComponent, ShippingMethodActivityLogListComponent,
    CollectionActivityLogListComponent, PaymentMethodActivityLogListComponent, PriceListActivityLogListComponent],
  exports: [SharedModule, ActivityLogListComponent, BrandActivityLogListComponent,ProductChangesCompareComponent,  ShippingMethodActivityLogListComponent,
    IndustryActivityLogListComponent, PaymentMethodActivityLogListComponent, AdminListComponent,
    CollectionActivityLogListComponent, PriceListActivityLogListComponent, ActivityLogFilterComponent],
  providers: [
  ]
})
export class ActivityLogSharedModule {}