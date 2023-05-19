import {NgModule } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import {CommonModule} from '@angular/common';
@NgModule({
    imports: [CommonModule,SharedModule],
    declarations: [],
    exports: [ SharedModule],
})
export class CmsSharedModule {}
