import { NgModule } from '@angular/core';
import { addNavMenuItem, SharedModule,addActionBarItem } from '@etech/admin-ui/package/core';
import {gql} from 'graphql-tag';
import {take} from 'rxjs/operators';
@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'invoices',
        label: 'Invoices',
        routerLink: ['/extensions/invoices'],
        icon: 'file-group',
        requiresPermission: 'AllowInvoicesPermission',
      },
      'sales'
    ),
    addActionBarItem({
      id: 'product-reviews',
      label: 'Generate invoice',
      locationId: 'order-detail',
      buttonStyle: 'outline',
      onClick:async (event,context)=>{
        const result:any=await context.dataService.mutate(gql`
          mutation GenerateInvoice($id: ID!){
            generateInvoice(id: $id){
              id
            }
          }
        `, {
          id: context.route.snapshot.params.id
        }).pipe(take(1)).toPromise();
        if(result.generateInvoice.id){
          context.notificationService.success('Invoice successfully generated');
        }
      },
    }),
  ],
})
export class InvoicesNavModule {}
