import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem} from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem({id: 'faq', label: 'FAQs', routerLink: ['/extensions/faqs'],}, 'cms')
  ]
})
export class FaqNavSharedModule {}