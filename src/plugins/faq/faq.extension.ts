import gql from 'graphql-tag'


const commonApiExtension=`
   extend type Query{
      getFaqs: [FaqType!]!
      getFilteredFaqs(tags: [String]!):[FaqType!]!
      faqTags: [String]!
   }  
   type FaqType{
      id: ID!
      question: String!, 
      answer: String!
      isEnabled: Boolean!
      createdAt: DateTime!
      tags: [String]
   }
`;

export const adminApiExtension= gql `
     
   ${commonApiExtension}
     input FaqInputType{
          #id: ID!
          question: String!, 
          answer: String!
          tags: [String]
     }

     
     extend type Mutation{
        createFaq(faq: FaqInputType!) : FaqType
        deleteFaq(id: ID!): FaqType
        editFaq(id: ID!, newFaq: FaqInputType!): FaqType
        enableFaq(id: ID!): FaqType
        disableFaq(id: ID!): FaqType
     }    
`;

export const shopApiExtension=gql`
   ${commonApiExtension}
`;