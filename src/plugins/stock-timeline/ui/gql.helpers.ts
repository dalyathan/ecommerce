import {gql} from 'graphql-tag';
export const stockOnHandQuery=gql`
    query GetProductVariantStockOnHand($id: ID!){
        productVariant(id: $id){
            createdAt
            customFields{
                stockTimeline{
                    id
                    stockOnHand
                    stockChange
                    createdAt
                    administrator{
                        firstName
                        lastName
                    }
                }
            }
        }
    }
`;