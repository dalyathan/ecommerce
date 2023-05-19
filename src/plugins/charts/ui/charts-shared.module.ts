import { NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  exports: [SharedModule],
})
export class ChartsSharedModule {}