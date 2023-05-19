import { NgModule } from '@angular/core';
import { SharedModule , addNavMenuItem} from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BrandsSharedModule } from './brands-shared.module';
@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    BrandsSharedModule,
  ],
  providers:[
    addNavMenuItem(
        {
          id: 'brands',
          label: 'Brands',
          routerLink: ['/extensions/catalog/list-brands'],
          icon: 'image',
          requiresPermission: (userPermissions:string[]):boolean=>{
              return userPermissions.filter((item)=>  
              item.endsWith('Brands') || item.endsWith('Catalog')).length > 0;
          }
        }, "catalog", "catalog"
    ),
    addNavMenuItem(
        {
          id: 'industries',
          label: 'Industries',
          routerLink: ['/extensions/catalog/list-industries'],
          icon: 'building',
          requiresPermission: (userPermissions:string[]):boolean=>{
            return userPermissions.filter((item)=>  
            item.endsWith('Industries') || item.endsWith('Catalog')).length > 0
          }
        }, "catalog", "catalog"
    )
  ],
})
export class BrandsUiExtensionModule { }
