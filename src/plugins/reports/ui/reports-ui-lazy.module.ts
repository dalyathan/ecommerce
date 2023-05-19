import { SalesReportComponent } from "./components/sales-report/sales-report.component";
import { StockReportComponent } from "./components/stock-report/stock-report.component";
import { RefundReportComponent } from "./components/refund-report/refund-report.component";
import { ReportsSharedModule } from "./reports-shared.module";
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';


@NgModule({
    imports: [
        ReportsSharedModule,
        RouterModule.forChild([
            {
                path: 'sales-report',
                component: SalesReportComponent,
            },
            {
                path: 'refund-report',
                component: RefundReportComponent,
            },
            {
                path: 'stock-report',
                component: StockReportComponent,
            },
        ]),
    ],
    declarations: [
        SalesReportComponent,
        RefundReportComponent,
        StockReportComponent
    ],
})
export class ReportsUiLazyModule {}
