import { PermissionDefinition } from "@etech/core";

export const createStockReportPermission = new PermissionDefinition({
    name: 'CreateStockReport',
    description: 'Allows creating of stock report'
  });

  export const createSalesReportPermission = new PermissionDefinition({
    name: 'CreateSalesReport',
    description: 'Allows creating of sales report'
  });

  export const createRefundReportPermission = new PermissionDefinition({
    name: 'CreateRefundReport',
    description: 'Allows creating of refund report'
  });