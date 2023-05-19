import { addNavMenuItem, SharedModule } from '@etech/admin-ui/package/core';
import { NgModule } from '@angular/core';
@NgModule({
    imports: [
      SharedModule,
    ],
    providers:[
        addNavMenuItem(
            {
              id: 'price-lists',
              label: 'Price List',
              routerLink: ['/extensions/customers/price-lists'],
              icon: 'view-list',
              requiresPermission: (userPermissions:string[]):boolean=>{
                return userPermissions.filter((item)=>  
                item === 'CreatePriceLists' || item === 'CreatePriceLists' 
                  || item === 'ReadPriceLists' || item === 'DeletePriceLists').length > 0;
            }
            }, "customers", "customers"
        ),
    ]})
export class PriceListUiExtensionModule {}