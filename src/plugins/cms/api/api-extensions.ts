import { gql } from 'apollo-server-core';
export const commonApiExtensions = gql`
    enum Type {
        POPUP
        STATIC
        CONTACT_INFO
        HERO_SECTION
        ADVERTISEMENT
        POLICIES
        FAQ
        SOCIAL
        BIG_SALE
    }
    type cms{
        id: ID!
        cmsType:Type!
        assets: [Asset]
        featuredAsset:Asset
        content:[String]
        translations:[CmsTranslation]
        languageCode: LanguageCode
    }
    type CmsTranslation {
        id: ID!
        languageCode: LanguageCode!
        content: String!
    }
    extend type Query {
        getCms(type:[Type!]):[cms]
    }
`;

export const adminApiExtensions = gql`
    ${commonApiExtensions}
    input createCmsInput{
        cmsType:Type!
        assetIds: [ID!]
        featuredAssetId: ID
        content:[String]
        translations: [CreateCmsTranslationInput!]
    }
    input CreateCmsTranslationInput {
        languageCode: LanguageCode!
        content: String!
    }
    extend type Mutation{
        createCms(input:createCmsInput!):cms
    }
`
export const shopApiExtensions = gql `
    ${commonApiExtensions}
`

