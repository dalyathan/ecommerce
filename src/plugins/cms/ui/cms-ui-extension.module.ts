import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection } from '@etech/admin-ui/package/core';
import {CmsSharedModule} from "./cms-shared.module";

@NgModule({
    imports: [SharedModule,CmsSharedModule],
    providers: [
        addNavMenuSection(
            {
                id: 'cms',
                label: 'Content Management',
                requiresPermission: 'ReadCms',
                items: [
                    {
                        id: 'home-page',
                        label: 'Home Page Content',
                        routerLink: ['/extensions/cms/home-page'],
                        icon: 'home',
                    },
                    {
                        id: 'static',
                        label: 'Static Pages',
                        routerLink: ['/extensions/cms/static'],
                        icon: 'paperclip',
                    },
                    {
                        id: 'policies',
                        label: 'Policies',
                        routerLink: ['/extensions/cms/policies'],
                        icon: 'details',
                    },
                ],
            },
            'settings',
        ),
    ],
    exports: [],
})
export class CmsUiExtensionModule {}
