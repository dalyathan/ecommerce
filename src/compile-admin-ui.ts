import { InvoicePlugin } from './plugins/invoice/invoice.plugin';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import { compileUiExtensions } from '@etech/ui-devkit/compiler';
import * as path from 'path';
import {CmsPlugin} from "./plugins/cms/cms-plugin";
import { ReportsPlugin } from './plugins/reports/plugin';
import { BulkUploadPlugin } from './plugins/bulk-upload/plugin';
import { QuotePlugin } from './plugins/quote/quote-plugin';
import { ChartsPlugin } from './plugins/charts/plugin';
import { BrandsPlugin } from './plugins/brands/plugin';

compileUiExtensions({
    outputPath: path.join(__dirname, 'admin-ui'),
    extensions: [
        ReviewsPlugin.uiExtensions, 
        ReportsPlugin.uiExtensions,
        CmsPlugin.uiExtensions,
        InvoicePlugin.ui,
        QuotePlugin.uiExtensions, 
        BulkUploadPlugin.uiExtensions, 
        ChartsPlugin.uiExtensions,
        BrandsPlugin.uiExtensions,
    ],
    devMode: true,
 }).compile?.().then(() => {
    process.exit(0);
});
