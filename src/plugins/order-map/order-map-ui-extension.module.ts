import { NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { registerDashboardWidget } from '@etech/admin-ui/package/core';

import { OrderMapSharedModule } from './order-map-shared.module';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    OrderMapSharedModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCPUDU0R4IutXMlinajGnm1tNQvUpoSNVs'
  }),
  ],
  providers:[
    registerDashboardWidget('Order Map', {
      title: 'Order Map',
      supportedWidths: [12],
      requiresPermissions: ['ReadCharts'],
      loadComponent: () =>
        import('./ui/order-map-widget/order-map-widget.component').then(
          m => m.OrderMapWidgetComponent,
        ),
    }),
  ]
})
export class OrderMapExtensionModule { }
