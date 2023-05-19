import gql from 'graphql-tag'


export default gql `
   type TestimonialType{
      id: ID!
      pic_location: String!
      msg: String!
      name: String!
      person_position: String!
 
   }
   extend type Query{
        getTestimonials: [TestimonialType]
   }

   extend type Mutation{
   setTestimonialPicture(id: ID!, pic_loc: String!): [TestimonialType]!
   
   createTestimonial(name: String! 
                    position: String! 
                    msg: String!
   ): TestimonialType

    
    removeTestimonial(id: ID!): [TestimonialType]!
   }
`;