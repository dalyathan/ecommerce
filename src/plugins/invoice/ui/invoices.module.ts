import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@etech/admin-ui/package/core';
import { InvoicesComponent } from './invoices.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: InvoicesComponent,
        data: { breadcrumb: 'Invoices' },
      },
    ]),
  ],
  declarations: [InvoicesComponent],
  // providers:[ProtectedFileAccessService]
})
export class InvoicesModule {}
