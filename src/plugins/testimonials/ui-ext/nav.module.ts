import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection , addNavMenuItem} from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem({id: 'testimonial', label: 'Testimonials', routerLink: ['/extensions/testimonials'],}, 'cms')
  ]
})
export class TestNavSharedModule {}