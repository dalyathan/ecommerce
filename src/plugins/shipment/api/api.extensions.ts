import {gql} from 'graphql-tag';

export const apiExtension=gql`
    extend type Query{
        shippingAvailableTo:[String]!
    }
`;