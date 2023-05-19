import { NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { registerDashboardWidget } from '@etech/admin-ui/package/core';

import { ChartsSharedModule } from './charts-shared.module';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    ChartsSharedModule,
  ],
  providers:[
    registerDashboardWidget('stock-charts', {
      title: 'Stocks Added',
      supportedWidths: [4, 6, 8, 12],
      requiresPermissions: ['ReadCharts'],
      loadComponent: () =>
        import('./widgets/stock-chart/stock-chart.component').then(
          m => m.StockChartComponent,
        ),
    }),
    registerDashboardWidget('sales-charts', {
      title: 'Sales Added',
      supportedWidths: [4, 6, 8, 12],
      requiresPermissions: ['ReadCharts'],
      loadComponent: () =>
        import('./widgets/sales-chart/sales-chart.component').then(
          m => m.SalesChartComponent,
        ),
    }),
    registerDashboardWidget('all-sales-charts', {
      title: 'All Order State',
      supportedWidths: [4,6,8,12],
      requiresPermissions: ['ReadCharts'],
      loadComponent: () =>
        import('./widgets/all-sales-chart/all-sales-chart.component').then(
          m => m.AllSalesChartComponent,
        ),
    }),
  ]
})
export class ChartsUiExtensionModule { }
