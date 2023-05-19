import {gql} from 'graphql-tag';

export const ARE_ORDER_LINE_ORDER_BASED=gql`
    query CheckIfOrderItemsAreOrderBased($id: ID!){
        order(id: $id){
            id
            lines{
                productVariant{
                    product{
                        customFields{
                            is_order_based
                        }
                    }
                }
            }
        }
    }
`