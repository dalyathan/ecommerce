import { Resolver , Query, Args, } from '@nestjs/graphql';
import { createRefundReportPermission, createSalesReportPermission, createStockReportPermission } from './permissions';
import { Allow, Ctx, RequestContext, } from '@etech/core';
import { RefundReport, RefundReportFilter, SalesReport, SalesReportFilter, StockReport, StockReportFilter } from '../ui/generated-admin-types';
import { RefundReportService } from './services/refund-admin-api.service';
import { SalesReportService } from './services/sales-admin-api.service';
import { StockReportService } from './services/stock-admin-api.service';

@Resolver()
export class ReportApiResolver{
    constructor(private refundReportService:RefundReportService, 
        private salesReportService: SalesReportService, private stockReportService:StockReportService){
    }
    @Query()
    @Allow(createStockReportPermission.Permission)
    async getStockReport(@Ctx() ctx: RequestContext, @Args('filter') filter: StockReportFilter): Promise<StockReport>{
        return await this.stockReportService.getStockReport(ctx, filter);
    }

    @Query()
    @Allow(createRefundReportPermission.Permission)
    async getRefundReport(@Ctx() ctx: RequestContext, @Args('filter') filter: RefundReportFilter): Promise<RefundReport>{
        return await this.refundReportService.getRefundReport(ctx, filter);
    }

    @Query()
    @Allow(createSalesReportPermission.Permission)
    async getSalesReport(@Ctx() ctx: RequestContext, @Args('filter') filter: SalesReportFilter): Promise<SalesReport>{
        return await this.salesReportService.getSalesReport(ctx, filter);
    }
}