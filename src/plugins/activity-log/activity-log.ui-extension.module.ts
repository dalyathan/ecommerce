import { NgModule } from '@angular/core';
import { SharedModule , addNavMenuSection} from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ActivityLogSharedModule } from './activity-log.shared.module';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    ActivityLogSharedModule,
  ],
  providers:[
    addNavMenuSection(
      {
          id: 'activity-logs',
          label: 'Activity Logs',
          collapsible: true,
          collapsedByDefault: true,
          requiresPermission: (userPermissions:string[]):boolean=>{
            return userPermissions.filter((item)=>  
            item.endsWith('ActivityLogs')).length > 0;
        },
          items: [
              {
                  id: 'product-related',
                  label: 'Product Related Logs',
                  routerLink: ['/extensions/activity-logs/product-related'],
                  icon: 'store',
              },
              {
                  id: 'order-related',
                  label: 'Order Related Logs',
                  routerLink: ['/extensions/activity-logs/order-related'],
                  icon: 'shopping-cart',
              },
              {
                id: 'customer-related',
                label: 'Customer Related Logs',
                routerLink: ['/extensions/activity-logs/customer-related'],
                icon: 'employee',
              },
              {
                id: 'brand',
                label: 'Brand Logs',
                routerLink: ['/extensions/activity-logs/brand'],
                icon: 'factory',
              },
              {
                id: 'industry',
                label: 'Industry Logs',
                routerLink: ['/extensions/activity-logs/industry'],
                icon: 'factory',
              },
              {
                id: 'shipping-method',
                label: 'Shipping Method Logs',
                routerLink: ['/extensions/activity-logs/shipping-method'],
                icon: 'truck',
              },
              {
                id: 'collection',
                label: 'Collection Logs',
                routerLink: ['/extensions/activity-logs/collection'],
                icon: 'employee',
              },
              {
                id: 'payment-methods',
                label: 'Payment Method Logs',
                routerLink: ['/extensions/activity-logs/payment-method'],
                icon: 'list',
              },
              {
                id: 'price-list',
                label: 'Price List Logs',
                routerLink: ['/extensions/activity-logs/price-list'],
                icon: 'dollar',
              },
          ],
      },
      'settings',
  ),
  ],
})
export class ActivityLogUiExtensionModule { }
