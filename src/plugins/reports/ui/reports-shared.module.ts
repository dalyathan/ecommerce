import { NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { SelectCustomerGroupsDialogComponent } from './select-customers-group-dialog/select-customer-groups-dialog.component';

@NgModule({
  imports: [SharedModule],
  exports: [SharedModule],
  declarations: [SelectCustomerGroupsDialogComponent]
})
export class ReportsSharedModule {}