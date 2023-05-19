import { EtechPlugin,PluginCommonModule } from "@etech/core";
import { Testimonial } from "./testimonials.model";
import { TestimonialResolver } from "./testimonials.resolver";
import path from 'path';
import extensions from './testimonials.extension';
import { TestimonialService } from "./testimonials.service";
import { AdminUiExtension } from "@etech/ui-devkit/compiler";
import { createTestimonialsPermissionDefinition, deleteTestimonialsPermissionDefinition,
    updateTestimonialsPermissionDefinition, readTestimonialsPermissionDefinition } from ".";

@EtechPlugin({
    imports: [PluginCommonModule],
    providers: [TestimonialService],
    entities: [Testimonial],
    adminApiExtensions:
        {resolvers: [TestimonialResolver], schema: extensions},
    shopApiExtensions: {resolvers: [TestimonialResolver], schema: extensions},
    configuration: config => {
        return config;
    }
    
})
export class TestimonialPlugin{
    public static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui-ext'),
        
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'nav.module.ts',
                ngModuleName: 'TestNavSharedModule',
            },
            // {
            //     type: 'lazy' as const,
            //     route: 'sales-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
            // {
            //     type: 'lazy' as const,
            //     route: 'customized-sales-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
            // {
            //     type: 'lazy' as const,
            //     route: 'stock-report',
            //     ngModuleFileName: 'reports.module.ts',
            //     ngModuleName: 'ReportsModule',
            // },
             {
             type: 'lazy' as const,
             route: 'testimonials',
                 ngModuleFileName: 'page.module.ts',
                 ngModuleName: 'TestimonialPageModule',
             }
        ],
    };
}