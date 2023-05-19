import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@etech/admin-ui/package/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem({
        id: 'quotes', 
        label: 'Quotes', 
        routerLink: ['/extensions/quotes'],
        requiresPermission: (userPermisions: string[]):boolean=>{
          return userPermisions.filter((item)=> item.match('Quotes')).length>0
        }
      }, 
      'customers'
    )
  ]
})
export class NavSharedModule {}