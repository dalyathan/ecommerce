import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@etech/admin-ui/package/core';
import { GreeterComponent } from './page.component';
import { CommonModule } from '@angular/common'; 

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild([{
      path: '',
      pathMatch: 'full',
      component: GreeterComponent,
      data: { 
        breadcrumb: 'FAQs',
        permissions:{
          allow: ['ReadFAQs','CreateFAQs','DeleteFAQs','UpdateFAQs']
        }, 
      },
     },
  ]),
  ],
  declarations: [GreeterComponent],
})
export class FaqPageModule {
  
}