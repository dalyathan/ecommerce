import { NgModule } from '@angular/core';
import { SharedModule,addNavMenuSection } from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';


import { ReportsSharedModule } from './reports-shared.module';



@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    ReportsSharedModule,
  ],
  providers:[
    addNavMenuSection({
      id: 'reports',
      label: 'Reports',
      requiresPermission(userPermissions:string[]):boolean {
        return userPermissions.filter((item)=> (item === 'CreateStockReport' 
        || item === 'CreateSalesReport' || item === 'CreateRefundReport')).length>0
      },
      collapsible: true,
      collapsedByDefault: true,
      items: [
        {
            id: 'sales-report',
            label: 'Sales Report',
            routerLink: ['/extensions/reports/sales-report'],
            requiresPermission: 'CreateStockReport',
            icon: 'list',
        },
        {
            id: 'stock-report',
            label: 'Stock Report',
            routerLink: ['/extensions/reports/stock-report'],
            requiresPermission: 'CreateSalesReport',
            icon: 'list',
        },
        {
          id: 'refund-report',
          label: 'Refund Report',
          routerLink: ['/extensions/reports/refund-report'],
          requiresPermission: 'CreateRefundReport',
          icon: 'list',
      },
      ],
    }),
  ]
})
export class ReportsUiExtensionModule { }
