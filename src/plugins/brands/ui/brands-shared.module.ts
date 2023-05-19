import { NgModule } from '@angular/core';
import { SharedModule,registerFormInputComponent } from '@etech/admin-ui/package/core';
import {ChooseBrandComponent} from './components/brands/choose-brand/choose-brand.component';
import { ChooseIndustryComponent } from './components/industry/choose-industry/choose-industry.component';


@NgModule({
  imports: [SharedModule,],
  declarations: [ChooseBrandComponent,ChooseIndustryComponent],
  exports: [SharedModule],
  providers: [
    registerFormInputComponent('choose-brand', ChooseBrandComponent),
    registerFormInputComponent('choose-industry', ChooseIndustryComponent),
  ]
})
export class BrandsSharedModule {}