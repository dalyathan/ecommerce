import gql from 'graphql-tag';

export const commonApiExtension = gql`
  type BrandType {
    id: ID!
    name: String!
    description: String!
    icon: Asset
    products: [Product]
  }
  type IndustryType {
    id: ID!
    name: String!
    description: String!
    icon: Asset
    products: [Product]
  }
  extend type Query{
    brands:[BrandType]
    industries:[IndustryType]
    brand(id:ID):BrandType
    industry(id:ID):IndustryType
  }
  `;

export const adminApiExtension = gql`
  ${commonApiExtension}

  input BrandInputType{
    id: ID
    name: String!
    description: String!
    iconId: ID
    productIds: [ID]!
  }

  input IndustryInputType{
    id: ID
    name: String!
    description: String!
    iconId: ID
    productIds: [ID]!
  }

  extend type Mutation{
    createBrand(args: BrandInputType!):BrandType!
    editBrand(args: BrandInputType!):BrandType!
    deleteBrand(id: ID):ID!
    createIndustry(args: IndustryInputType!):IndustryType!
    deleteIndustry(id: ID):ID!
    editIndustry(args: IndustryInputType!):IndustryType!
  }
  `;
