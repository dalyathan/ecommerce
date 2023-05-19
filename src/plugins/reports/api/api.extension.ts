import gql from 'graphql-tag';
export const adminApiExtension=gql`
    input SalesReportFilter{
        orderPlacedAt: DateOperators
        taxRate: ID
        discount: Float
        total: Float
        productIds: [ID]
        productVariantIds: [ID]
        customerIds: [ID]
        customerCategoryIds: [ID]
    }

    input StockReportFilter{
        stockOnHand: Int
        createdAt: DateOperators
        stockFrom: DateTime
    }

    input RefundReportFilter{
        amount: Float
        purchased: DateOperators
    }

    type RefundReportContent{
        orderId: ID
        orderCode: String
        refunded: String
        customerId: ID
        customer: String
        purchaseDate: String 
        price: String
        paymentMethod: String
        refundType: String
        refundedAmount: String
        refundedBy: String
        refundedById: ID
    }

    type StockReportContent{
        productId: ID
        img: String
        sku: String
        name: String
        createdAt: String
        openingStock: String
        stockOnHand: String
        closingStock: String
        defaultPrice: String
        customerGroup: String
        segmentPrice: String
    }

    type SalesReportContent{
        orderId: ID
        productId: ID
        orderCode: String
        orderPlacedAt: String
        customer: String
        customerId: ID
        sku: String
        unitPrice: String
        totalPrice: String
        discount: String
        taxRate: String
        taxCollected: String
        totalAmount: String
        paymentMethod: String
    }

    type StockReport{
        content: [StockReportContent]!
        header: String
        priceIncludesTax: Boolean
    }

    type SalesReport{
        content: [SalesReportContent]!
        header: String
        priceIncludesTax: Boolean
    }

    type RefundReport{
        content: [RefundReportContent]!
        header: String
        priceIncludesTax: Boolean
    }

    extend type Query{
        getSalesReport(filter: SalesReportFilter): SalesReport!
        getStockReport(filter: StockReportFilter): StockReport!
        getRefundReport(filter: RefundReportFilter): RefundReport!
    }
`;