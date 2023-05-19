import gql from 'graphql-tag';

export const commonApiExtention=`
    type InstantMessageType{
        id: ID!,
        userEmail: String!,
        isFromAdmin: Boolean,
        msg: String!,
        isSeen: Boolean!
        sentAt: DateTime!
        lastName: String
        firstName: String
        createdAt: DateTime!
    }
`;
export const adminApiExtension=gql`
    ${commonApiExtention}
    extend type Mutation{
        writeInstantMessage(userEmail: String!, msg: String!, isFromAdmin: Boolean, firstName: String, lastName: String): InstantMessageType
        makeSeenByAdmin(ids:[ID]!): Success
   }

   extend type Query{
        getAllInstantMessages: [InstantMessageType]
    }
`

export const shopApiExtensions= gql`
    ${commonApiExtention}
    extend type Mutation{
         writeInstantMessage(userEmail: String!, msg: String!, isFromAdmin: Boolean, firstName: String, lastName: String): InstantMessageType
         makeSeenByUser(ids: [ID]!): Success
    }
    
    extend type Query{
        getUserInstantMessage(userEmail: String!): [InstantMessageType]
    }
`;