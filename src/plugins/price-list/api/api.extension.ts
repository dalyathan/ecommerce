import gql from 'graphql-tag'

export const adminApiExtension=gql`

    input PriceListInput{
        id: ID
        title: String
        productVariantIds: [ID]
        customerGroupId: ID
        percentDiscount: String
    }

    input EditPriceListInput{
        priceListId: ID!
        title: String!
        productVariantIds: [ID]!
        customerGroupId: ID
        percentDiscount: String!
    }

    type PriceListDisplay{
        typename:String!
        id: ID!
        productVariantIds: [ID]!
        title: String!
        percentDiscount: String!
        customergroup: CustomerGroup
        enabled: Boolean!
        isPriceListStoreWide: Boolean!
    }

    type PriceListCreationError{
        typename:String!
        message:String!
    }

    union PriceListCreateResult = PriceListDisplay | PriceListCreationError

    extend type Mutation{
        createPriceList(input: PriceListInput): PriceListDisplay!
        editPriceList(input: EditPriceListInput): PriceListDisplay!
        togglePriceList(id: ID!): PriceListDisplay!
        createStoreWideDiscount(input: PriceListInput): PriceListDisplay!
        editStoreWideDiscount(input: EditPriceListInput): PriceListDisplay!
    }

    extend type Query{
        priceLists:[PriceListDisplay]!
    }
`;