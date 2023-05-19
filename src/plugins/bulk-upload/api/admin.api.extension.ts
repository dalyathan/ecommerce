import {gql} from 'graphql-tag';
export const adminApiExtension=gql`
    extend type Mutation{
        uploadBulkData(input: [ActualProduct]!):String
    }

    input ActualProduct{
        name: String!
        slug: String!
        description: String!
        featuredAsset: CreateAssetInput!
        options: [String]!
        variants: [ActualProductVariant]!
    }

    input ActualProductVariant{
        sku: String!
        price: Float!
        description: String!
        featuredAsset: CreateAssetInput!
        stockOnHand: Int!
        values:[String]!
        name: String!
    }
`;