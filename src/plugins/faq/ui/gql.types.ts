import {gql} from 'graphql-tag';
const FAQ_FRAGMENT=`
    question
    answer
    id
    isEnabled
    createdAt
    tags
`;
export const QUERY = gql `
{
  getFaqs{
    ${FAQ_FRAGMENT}
  }
}
`;
export const CREATE_QUERY = gql ` 
 mutation CreateFaq($answer: String!, $question: String!,$tags: [String]){
  createFaq(faq: {answer: $answer, question: $question,tags: $tags}){
    ${FAQ_FRAGMENT}
  }
}`;
export const EDIT_QUERY = gql `
mutation EditFaq($id: ID!, $question: String!, $answer: String!, $tags: [String]){

  editFaq(id: $id, newFaq: {question: $question, answer: $answer,tags: $tags}){
    ${FAQ_FRAGMENT}
   }
}
`;
export const DELETE_MUTATION = gql`
mutation DeleteFaq($id: ID!){

  deleteFaq(id: $id){
    id
  }
}
`;

export const ENABLE_MUTATION = gql`
mutation EnableFaq($id: ID!){
  enableFaq(id: $id){
    ${FAQ_FRAGMENT}
  }
}
`;

export const DISABLE_MUTATION = gql`
mutation DisableFaq($id: ID!){
  disableFaq(id: $id){
    ${FAQ_FRAGMENT}
  }
}
`;