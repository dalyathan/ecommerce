import { NgModule } from '@angular/core';
import { SharedModule , addNavMenuItem} from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem({
      id: 'messages', 
      label: 'Messages', 
      routerLink: ['/extensions/contactus'],
      requiresPermission: (userPermissions:string[]):boolean=>{
        return userPermissions.filter((item)=>  
        item.endsWith('ContactUs')).length > 0;
    }
    }, 'customers')
  ]
})
export class ContactUsNavSharedModule {}