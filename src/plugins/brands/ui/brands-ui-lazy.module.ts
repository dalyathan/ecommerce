import {  AddBrandsComponent } from "./components/brands/add-brands/add-brands.component";
import {  ListBrandsComponent } from "./components/brands/list-brands/list-brands.component";
import { BrandsSharedModule } from "./brands-shared.module";
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AddIndustryComponent } from "./components/industry/add-industry/add-industry.component";
import { ListIndustryComponent } from "./components/industry/list-industry/list-industry.component";
import { CanDeactivateDetailGuard } from "@etech/admin-ui/package/core";


@NgModule({
    imports: [
        BrandsSharedModule,
        RouterModule.forChild([
            {
                path: 'brands/:id',
                component: AddBrandsComponent,
                canDeactivate: [CanDeactivateDetailGuard],
                data: { 
                    permissions:{
                        allow: ['ReadBrands','UpdateBrands']
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Brands',
                                link: ['/extensions','catalog','list-brands'],
                            },
                            {
                                label: '',
                                link: ['/extensions','catalog','brands'],
                            },
                        ];
                    } 
                },
            },
            {
                path: 'add-brands',
                component: AddBrandsComponent,
                canDeactivate: [CanDeactivateDetailGuard],
                data: { 
                    permissions:{
                        allow: 'CreateBrands'
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Brands',
                                link: ['/extensions','catalog','list-brands'],
                            },
                            {
                                label: 'Add Brand',
                                link: ['/extensions','catalog','add-brands'],
                            },
                        ];
                    } 
                },
            },
            {
                path: 'list-brands',
                component: ListBrandsComponent,
                data: { 
                    permissions:{
                        allow: 'ReadBrands'
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Brands',
                                link: ['/extensions','catalog','list-brands'],
                            }
                        ];
                    } 
                },
            },
            {
                path: 'industries/:id',
                component: AddIndustryComponent,
                canDeactivate: [CanDeactivateDetailGuard],
                data: { 
                    permissions:{
                        allow: ['ReadIndustries','CreateIndustries','UpdateIndustries']
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Industries',
                                link: ['/extensions','catalog','list-industries'],
                            },
                            {
                                label: '',
                                link: ['/extensions','catalog','industries'],
                            },
                        ];
                    } 
                },
            },
            {
                path: 'add-industry',
                component: AddIndustryComponent,
                canDeactivate: [CanDeactivateDetailGuard],
                data: { 
                    permissions:{
                        allow: 'CreateIndustries'
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Industries',
                                link: ['/extensions','catalog','list-industries'],
                            },
                            {
                                label: 'Add Industry',
                                link: ['/extensions','catalog','add-industry'],
                            },
                        ];
                    } 
                },
            },
            {
                path: 'list-industries',
                component: ListIndustryComponent,
                data: { 
                    permissions:{
                        allow: 'ReadIndustries'
                    },
                    breadcrumb: ()=>{
                        return [
                            {
                                label: 'Industries',
                                link: ['/extensions','catalog','list-industries'],
                            },
                        ];
                    } 
                },
            },
        ]),
    ],
    declarations: [
        AddBrandsComponent,
        ListBrandsComponent,
        AddIndustryComponent,
        ListIndustryComponent
    ],
})
export class BrandsUiLazyModule {}