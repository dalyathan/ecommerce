import gql from 'graphql-tag';

export const CREATE_CMS = gql`
    mutation CreateCms($input: createCmsInput!) {
        createCms (input: $input) {
            id
            cmsType
            content
            featuredAsset{
                id
                preview
            }
        }
    }
`;
