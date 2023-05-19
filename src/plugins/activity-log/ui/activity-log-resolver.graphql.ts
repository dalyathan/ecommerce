import gql from 'graphql-tag';
export const ACTIVITY_LOG_FRAGMENT=`
    id
    description
    latest
    dateTime
`;
export const PRODUCT_ACTIVITY_LOGS=gql`
    query GetProductActivityLogs($filter: ActivityLogFilter){
        productActivityLogs(filter: $filter){
           ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_PRODUCT_CHANGE=gql`
    mutation RevertProductChanges{
        revertProductChanges(id: ID){
            revertProductChanges(id: id)
        }
    }
`;

export const DELETE_PRODUCT_ACTIVITY_LOG=gql`
    mutation DeleteProductActivityLog($id: ID){
        deleteProductActivityLog(id: $id)
    }
`;

export const ORDER_ACTIVITY_LOGS=gql`
    query GetOrderRelatedActivityLogs($filter: ActivityLogFilter){
        orderRelatedActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_ORDER_RELATED_CHANGE=gql`
    mutation RevertOrderRelatedChanges($id: ID){
        revertOrderRelatedChanges(id: $id)
    }
`;

export const DELETE_ORDER_RELATED_ACTIVITY_LOG=gql`
    mutation DeleteOrderRelatedActivityLog($id: ID){
        deleteOrderRelatedActivityLog(id: $id)
    }
`;

export const COLLECTION_ACTIVITY_LOGS=gql`
    query GetCollectionActivityLogs($filter: ActivityLogFilter){
        collectionActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_COLLECTION_CHANGE=gql`
    mutation RevertOrderRelatedChanges($id: ID){
        revertCollectionChanges(id: $id)
    }
`;

export const DELETE_COLLECTION_ACTIVITY_LOG=gql`
    mutation DeleteCollectionActivityLog($id: ID){
        deleteCollectionActivityLog(id: $id)
    }
`;

export const INDUSTRY_ACTIVITY_LOGS=gql`
    query GetIndustryActivityLogs($filter: ActivityLogFilter){
        industryActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_INDUSTRY_CHANGE=gql`
    mutation RevertIndustryChanges($id: ID){
        revertIndustryChanges(id: $id)
    }
`;

export const DELETE_INDUSTRY_ACTIVITY_LOG=gql`
    mutation DeleteIndustryActivityLog($id: ID){
        deleteIndustryActivityLog(id: $id)
    }
`;

export const BRAND_ACTIVITY_LOGS=gql`
    query GetBrandActivityLogs($filter: ActivityLogFilter){
        brandActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_BRAND_CHANGE=gql`
    mutation RevertBrandChanges($id: ID){
        revertBrandChanges(id: $id)
    }
`;

export const DELETE_BRAND_ACTIVITY_LOG=gql`
    mutation DeleteBrandActivityLog($id: ID){
        deleteBrandActivityLog(id: $id)
    }
`;

export const SHIPPING_METHOD_ACTIVITY_LOGS=gql`
    query GetShippingMethodActivityLogs($filter: ActivityLogFilter){
        shippingMethodActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_SHIPPING_METHOD_CHANGE=gql`
    mutation RevertShippingMethodChanges($id: ID){
        revertShippingMethodChanges(id: $id)
    }
`;

export const DELETE_SHIPPING_METHOD_ACTIVITY_LOG=gql`
    mutation DeleteShippingMethodActivityLog($id: ID){
        deleteShippingMethodActivityLog(id: $id)
    }
`;

export const PAYMENT_METHOD_ACTIVITY_LOGS=gql`
    query GetPaymentMethodActivityLogs($filter: ActivityLogFilter){
        paymentMethodActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_PAYMENT_METHOD_CHANGE=gql`
    mutation RevertPaymentMethodChanges($id: ID){
        revertPaymentMethodChanges(id: $id)
    }
`;

export const DELETE_PAYMENT_METHOD_ACTIVITY_LOG=gql`
    mutation DeletePaymentMethodActivityLog($id: ID){
        deletePaymentMethodActivityLog(id: $id)
    }
`;

export const CUSTOMER_RELATED_ACTIVITY_LOGS=gql`
    query GetCustomerRelatedActivityLogs($filter: ActivityLogFilter){
        customerRelatedActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_CUSTOMER_RELATED_CHANGE=gql`
    mutation RevertCustomerRelatedChanges($id: ID){
        revertCustomerRelatedChanges(id: $id)
    }
`;

export const DELETE_CUSTOMER_RELATED_ACTIVITY_LOG=gql`
    mutation DeleteCustomerRelatedActivityLog($id: ID){
        deleteCustomerRelatedActivityLog(id: $id)
    }
`;

export const PRICE_LIST_ACTIVITY_LOGS=gql`
    query GetPriceListActivityLogs($filter: ActivityLogFilter){
        priceListActivityLogs(filter: $filter){
            ${ACTIVITY_LOG_FRAGMENT}
        }
    }
`;

export const REVERT_PRICE_LIST_CHANGE=gql`
    mutation RevertPriceListChanges($id: ID){
        revertPriceListChanges(id: $id)
    }
`;

export const DELETE_PRICE_LIST_ACTIVITY_LOG=gql`
    mutation DeletePriceListActivityLog($id: ID){
        deletePriceListActivityLog(id: $id)
    }
`;