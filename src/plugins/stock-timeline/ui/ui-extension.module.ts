import { NgModule } from '@angular/core';
import { registerFormInputComponent, SharedModule } from '@etech/admin-ui/package/core';
import { ProductVariantStockTimeline } from './product-variant-stock-timeline';
@NgModule({
    imports: [SharedModule],
    declarations: [ProductVariantStockTimeline],
    providers: [
        registerFormInputComponent('stock-timeline', ProductVariantStockTimeline),
    ],
    exports:[
        // ProtectedFileAccessService
    ]
})
export class StockTimelineExtensionModule {}