import { ChartsSharedModule } from "./charts-shared.module";
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';



@NgModule({
    imports: [
        ChartsSharedModule,
    ],
})
export class ChartsUiLazyModule {}
