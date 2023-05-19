import {  BulkUploadComponent } from "./components/bulk-upload/bulk-upload.component";
import { BulkUploadSharedModule } from "./bulk-upload-shared.module";
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CanDeactivateDetailGuard } from "@etech/admin-ui/package/core";


@NgModule({
    imports: [
        BulkUploadSharedModule,
        RouterModule.forChild([
            {
                path: 'bulk-upload',
                component: BulkUploadComponent,
                data: { 
                    permissions:{
                        allow: 'CreateBulkUpload'
                    },
                     breadcrumb: 'Bulk Upload' 
                },
                canDeactivate: [CanDeactivateDetailGuard],
                // : { breadcrumb: 'Instant Messages' },
            },
        ]),
    ],
    declarations: [
        BulkUploadComponent
    ],
})
export class BulkUploadUiLazyModule {}
