import {gql} from 'graphql-tag';
export const adminApiExtension=gql`
 type StockChangeLog{
    id: ID!
    stockOnHand: Int!
    stockChange: Int!
    createdAt: DateTime!
    item: ProductVariant!
    administrator: Administrator!
 }
`;