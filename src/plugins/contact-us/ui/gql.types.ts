import {gql} from 'graphql-tag';
export const ContactUsFragment=`
    id
    phone_number
    email
    first_name
    last_name
    message
    createdAt
`;
export const QUERY = gql` 
  query GetContactUsList{
    getAllContactUsMessages{
      ${ContactUsFragment}
    }
  }
  
  `
export  const SEENQUERY = gql`
  mutation MakeContactUsMessageSeen($id:ID!){
    makeContactUsMessageSeen(id: $id){
        ${ContactUsFragment}
    }
  }`;

  export const DELQUERY = gql`
  mutation DeleteConactUsMessage($id:ID!){
    deleteContactUsMessage(id: $id){
         id
    }
  }`;
