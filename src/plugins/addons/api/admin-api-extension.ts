import gql from 'graphql-tag';
import { commonApiExtension } from './common-api-extension';

export const adminApiExtension=gql`
    ${commonApiExtension}
    extend type Mutation{
        uploadDocumentation(input: CreateAssetInput!):String
        updateBestSellers: Boolean
    }

    extend type Query{
        lastTimeBestSellerWasUpdated: DateTime
    }
`;