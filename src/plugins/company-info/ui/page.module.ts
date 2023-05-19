import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@etech/admin-ui/package/core';
import { GreeterComponent } from './page.component';
import { CommonModule } from '@angular/common'; 
import {AgmCoreModule} from '@agm/core';



@NgModule({
  imports: [
    SharedModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCPUDU0R4IutXMlinajGnm1tNQvUpoSNVs'
    }),
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: GreeterComponent,
      data: { breadcrumb: 'Company Profile' },
     },
  ]),
  ],
  declarations: [GreeterComponent],
})
export class CompanyInfoPageModule {
  
}
