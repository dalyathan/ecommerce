import gql from 'graphql-tag';

export const CREATE_CMS = gql`
    mutation createCms($input: createCmsInput!) {
        createCms (input: $input) {
            id
            cmsType 
            content
            featuredAsset{
                preview
            }
        }
    }
`;
