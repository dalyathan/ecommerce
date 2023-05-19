import { NgModule } from '@angular/core';
import { SharedModule , addNavMenuItem} from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BulkUploadSharedModule } from './bulk-upload-shared.module';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    BulkUploadSharedModule,
    HttpClientModule, 
    HttpClientJsonpModule
  ],
  providers:[
    addNavMenuItem(
      // sectionId: 'catalog',
      // config: 
        {
          id: 'bulk-upload',
          label: 'Bulk Upload',
          routerLink: ['/extensions/catalog/bulk-upload'],
          icon: 'upload',
          requiresPermission: 'CreateBulkUpload'
        }, "catalog", "catalog"
      // sectionId: "catalog"
    )
  ]
})
export class BulkUploadUiExtensionModule { }
