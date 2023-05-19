import gql from 'graphql-tag';

export const GET_CMS = gql`
    query getCms($Type: [Type!]!) {
        getCms(type: $Type) {
            id
            content
            cmsType
            featuredAsset{
                preview
            }
        }
    }
`;
