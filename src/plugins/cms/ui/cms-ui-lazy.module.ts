import { NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@etech/admin-ui/package/core';
import { GetCms } from './generated-types';
import {HomepageComponent} from "./components/homepage/homepage.component";
import {HeroSectionComponent} from "./components/homepage/heroSection/heroSection.component";
import {AdvertisementComponent} from "./components/homepage/advertisment/advertisement.component";
import {PopupComponent} from "./components/homepage/popup/popup.component";
import {StaticPagesComponent} from "./components/static pages/static-pages.component";
import {PoliciesComponent} from "./components/policies/policies.component";
import {CmsResolver} from "./providers/routing/cms-resolver";
import { BigSaleComponent } from './components/homepage/big-sale/big-sale.component';
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: 'home-page',
                component: HomepageComponent,
                data: { breadcrumb: 
                    'Home Page Content',
                 },
            },
            {
                path: 'static',
                component: StaticPagesComponent,
                data: { breadcrumb: 'Static Pages' },
            },
            {
                path: 'policies',
                component: PoliciesComponent,
                data: { breadcrumb: 'Policies' },
            },
        ]),
    ],
    declarations: [HomepageComponent,HeroSectionComponent,AdvertisementComponent,PopupComponent,StaticPagesComponent,PoliciesComponent, BigSaleComponent],
    providers: [CmsResolver],
})
export class CmsUiLazyModule {}

export function cmsBreadcrumb(resolved: { data: GetCms.GetCms }) {
    return [
        {
            label: 'Content management',
            link: ['/extensions', 'cms'],
        },
        //TODO: breadcrumbs for each cms
        // {
        //     label: `${resolved}`,
        //     link: ['/extensions', 'cms'],
        // },
    ];
}

