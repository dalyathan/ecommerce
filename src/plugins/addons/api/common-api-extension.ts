import gql from 'graphql-tag';

export const commonApiExtension=gql`
    type BestSellerResult{
        id: ID!
        variantId: ID
        description: String!
        collections: [ID]!
        name: String
        image: String
        priceWithTax: String!
        price: String
        slug: String!
        rating: String
        sku: String!
        is_order_based:Boolean
    }

    input RegisterEtechCustomerInput{
        email: String!
        password: String!
        firstName: String!
        lastName: String!
        phoneNumber: String!
        fax: String!
        company: String!
        country: String!
        city: String!
        state: String!
        street: String!
        job: String!
        tin: String
    }

    extend type Query{
        bestSellersInCategory(id:ID):[BestSellerResult]!
        bestSellingProducts:[BestSellerResult]!
        simpleSearch(text: String):[Product]!
        isActiveOrderPayable:Boolean!
    }
    
    extend type Mutation{
        registerEtechCustomer(input: RegisterEtechCustomerInput):Success
        cancelMyOrder:Success
        setSelfPickupAsShippingMethod:Success
    }

    extend type Collection{
        products: [Product]!
    }

    extend type ProductVariant{
        accessories: [Product]!
        is_order_based: Boolean
        priceWithoutDiscount: Int!
    }

    extend type Product{
        accessories: [Product]!
    }

    extend type Order{
        witholdingTax: Int!
    }
`;