import gql from 'graphql-tag';

export const apiExtension=gql`
    extend type Mutation{
        revertProductChanges(id: ID): Boolean
        deleteProductActivityLog(id: ID): Boolean
        revertOrderRelatedChanges(id: ID): Boolean
        deleteOrderRelatedActivityLog(id: ID): Boolean
        revertCollectionChanges(id: ID): Boolean
        deleteCollectionActivityLog(id: ID): Boolean
        revertIndustryChanges(id: ID): Boolean
        deleteIndustryActivityLog(id: ID): Boolean
        revertBrandChanges(id: ID): Boolean
        deleteBrandActivityLog(id: ID): Boolean
        revertShippingMethodChanges(id: ID): Boolean
        deleteShippingMethodActivityLog(id: ID): Boolean
        revertPaymentMethodChanges(id: ID): Boolean
        deletePaymentMethodActivityLog(id: ID): Boolean
        revertCustomerRelatedChanges(id: ID): Boolean
        deleteCustomerRelatedActivityLog(id: ID): Boolean
        revertPriceListChanges(id: ID): Boolean
        deletePriceListActivityLog(id: ID): Boolean
    }

    extend type Query{
        productActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        orderRelatedActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        collectionActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        industryActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        brandActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        shippingMethodActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        paymentMethodActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        customerRelatedActivityLogs(filter: ActivityLogFilter):[ActivityLog]
        priceListActivityLogs(filter: ActivityLogFilter):[ActivityLog]
    }

    type ActivityLog{
        id: ID!
        description: String!
        latest: Boolean!
        dateTime: DateTime
    }

    input ActivityLogFilter{
        adminIds: [ID]
        createdAt: DateOperators
    }
`;