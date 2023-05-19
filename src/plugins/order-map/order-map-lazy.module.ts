import { OrderMapSharedModule } from "./order-map-shared.module";
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from "@agm/core";



@NgModule({
    imports: [
        OrderMapSharedModule,
    ],
})
export class OrderMapLazyModule {}
