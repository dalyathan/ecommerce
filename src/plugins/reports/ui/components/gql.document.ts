export const GET_REFUNDS = `
query GetRefundReport($input: RefundReportFilter){
    getRefundReport(filter: $input){
        header
        content{
            orderId
            orderCode
            refunded
            customerId
            customer
            purchaseDate
            price
            paymentMethod
            refundType
            refundedAmount
            refundedBy
            refundedById
        }
    }
}
`;
export const ORDERS = `
query GetSalesReport($input: SalesReportFilter){
    getSalesReport(filter: $input){
        header
        content{
            productId
            orderId
            orderPlacedAt
            customer
            sku
            unitPrice
            totalPrice
            discount
            taxRate
            taxCollected
            totalAmount
            paymentMethod
            orderCode
            customerId
        }
        priceIncludesTax
    }
  }
`;

export const GET_PRODUCTS = `
    query GetStockReport($input: StockReportFilter){
        getStockReport(filter: $input){
            header
            priceIncludesTax
            content{
                productId
                img
                sku
                name
                createdAt
                openingStock
                stockOnHand
                defaultPrice
                customerGroup
                segmentPrice
                closingStock
            }
        }
    }
`;