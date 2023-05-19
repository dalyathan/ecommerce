import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection , addNavMenuItem} from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem({
      id: 'company_info', 
      label: 'Company Profile', 
      routerLink: ['/extensions/company_info'],}, 
      'cms')
  ]
})
export class CompanyInfoSharedModule {}