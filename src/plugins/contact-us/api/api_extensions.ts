import gql from 'graphql-tag';


export const contactUsApiExtensions = gql`
  type ContactUsMessage{
      id: ID!
      first_name: String!
      last_name: String!
      phone_number: String!
      createdAt: DateTime!
      email: String!
      message: String!
      is_seen: Boolean!

  }
  input ContactUsInput{
      firstName: String!
      lastName: String!
      phoneNumber: String!
      email: String!
      message: String!
  }
  extend type Mutation{
     writeContactUsMessage(message: ContactUsInput!): ContactUsMessage
     makeContactUsMessageSeen(id: ID!): ContactUsMessage
     deleteContactUsMessage(id: ID!): ID

  }
  extend type Query{
     getContactUsMessage(id: ID!): ContactUsMessage
     getAllContactUsMessages: [ContactUsMessage]
  }




`;