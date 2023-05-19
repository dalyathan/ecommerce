import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem} from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    // addNavMenuSection({
    //   id: 'see-quote',
    //   label: 'Quote',
    //   items: [{
    //     id: 'greeter',
    //     label: 'Quotes',
    //     routerLink: ['/extensions/quotes'],
    //     // Icon can be any of https://clarity.design/icons
    //     icon: 'cursor-hand-open',
    //   }],
    // },
    // // Add this section before the "settings" section
    // 'settings'),
    addNavMenuItem({id: 'instant_messages', label: 'Instant Messages', routerLink: ['/extensions/instantmessages'],}, 'customers')
  ]
})
export class InstantMessagesNavSharedModule {}