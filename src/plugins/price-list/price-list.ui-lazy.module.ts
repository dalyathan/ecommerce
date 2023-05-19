import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ViewPriceListsComponent} from './ui/components/view-price-lists/view-price-lists.component';
import { SharedModule } from '@etech/admin-ui/package/core';
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: 'price-lists',
                component: ViewPriceListsComponent,
                data: { breadcrumb: ()=>{
                    return [
                        {
                            label: 'Price List',
                            link: ['/extensions','customers','price-lists'],
                        }
                    ];
                } },
            },
        ]),
    ],
    declarations:[ViewPriceListsComponent]
})
export class PriceListUiLazyModule {}