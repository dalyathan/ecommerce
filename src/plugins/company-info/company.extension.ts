import gql from 'graphql-tag'



export default gql `

     type CompanyInfo{
          commercial_bank: String
          or_bank: String
          ab_bank : String
          tele_birr: String
          dashen_bank : String
           berhan_bank: String
            id: ID!

            facebook_address: String,

            linkdin_address: String,

            twitter_address: String,

            phone_number: String,

            email: String,

            youtube_address: String,

            telegram_address: String,

            instagram_address: String,

            longtude: Float,
            location_text: String
            latitude: Float,
            company_name: String!
            icon: Asset
     }

     extend type Mutation{
          setCompanyInfo(
            company_name: String =""

            facebook_address: String="",

            linkdin_address: String="",

            twitter_address: String="",

            phone_number: String="",

            email: String="",

            youtube_address: String="",

            telegram_address: String="",

            instagram_address: String="",

            longitude: Float=0,

            latitude: Float=0,
            icon_id: ID,
            location_text: String=""
            commercial_bank: String=""
            or_bank: String=""
            ab_bank : String=""
            tele_birr: String=""
            dashen_bank : String=""
             berhan_bank: String=""
          
          ): CompanyInfo!
 
     }
     extend type Query{
          getCompanyInfos: CompanyInfo!
     }
`
