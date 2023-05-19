import gql from 'graphql-tag';

export const quoteCommonExtensions = `
    type QuoteType{
        id: ID!
        msg: String! 
        subject: String!
        fromEmail: String!
        fromPhone: String!
        location: String!
        productDescr: String
        forProducts: [ProductVariant]
        createdAt: DateTime!
        isseen: Boolean!
        isSpecial: Boolean
        companyName: String!
        uuid: String
        isApproved: Boolean!
        orderRef: String
        adminName: String
        assetUrl: String
    }

    input QuoteInputType{
        msg: String!
        subject: String!
        fromEmail: String!
        fromPhone: String!
        location: String!
        productDescr: String
        productIds: [String]
        isSpecial: Boolean
        companyName: String! = ""
        userEmail: String
    }  

    extend type Query{
        getQueryOf(email: String!): [QuoteType]
    }
    extend type Mutation{
        writeQuote(args: QuoteInputType!): QuoteType!
    }
`;
export const quoteShopApiExtensions = gql`
        ${quoteCommonExtensions}
`;

export const quoteAdminApiExtensions = gql`
    ${quoteCommonExtensions}
    input QuoteFilter{
        isSeen: Boolean
        isApproved: Boolean
    }
    extend type Query{
        getQuotesForCustomer(email: String!): [String]
        getQuote(id: ID!): QuoteType
        getAllQuotes(filter: QuoteFilter): [QuoteType!]
        getQuoteResponseLink(
            id: ID!
        ): String!
    }

    extend type Mutation{
        deleteQuote(id: ID!): QuoteType
        makeQuoteSeen(id: ID!): QuoteType
        approveQuote(id: ID!): QuoteType
        regenerateQuote(id: ID!): QuoteType
    }
`;
