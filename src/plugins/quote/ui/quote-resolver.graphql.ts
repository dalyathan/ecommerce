import { gql } from 'graphql-tag';

const QUOTE_FRAGMENT=`
        id
        productDescr
        createdAt
        subject
        fromEmail
        fromPhone
        isSpecial
        isseen
        isApproved
        msg
        location
        companyName
        assetUrl
`;
export const APPROVE_MUATION = gql`
  mutation ApproveQuote($id: ID!){
    approveQuote(id: $id){
      ${QUOTE_FRAGMENT}
    }
  }
`
export const QUERY = gql`
  query GetQuotes($filter: QuoteFilter){
      getAllQuotes(filter:$filter){
        ${QUOTE_FRAGMENT}
      }
  }
`;
export const DELETE_QUOTE = gql`
  mutation DeleteQuote($id:ID!){
    deleteQuote(id: $id){
      ${QUOTE_FRAGMENT}
    }
  }
`;
export const MAKE_QUOTE_SEEN = gql`
  mutation MakeQuoteSeen($id:ID!){
    makeQuoteSeen(id: $id){
      ${QUOTE_FRAGMENT}
    }
  }
`;
export const REGENRATE_QUOTE= gql`
  mutation RegenerateQuote($id:ID!){
    regenerateQuote(id: $id){
      ${QUOTE_FRAGMENT}
    }
  }
`;