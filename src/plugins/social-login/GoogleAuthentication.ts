import axios from 'axios'
import {
    AuthenticationStrategy,
     ExternalAuthenticationService,
     Injector,
     RequestContext,
     User,
   } from '@etech/core';
   import { Credentials, OAuth2Client } from 'google-auth-library';
   import { DocumentNode } from 'graphql';
   import gql from 'graphql-tag';
   
   export type GoogleAuthData = {
    //  token: string;
    //  access_token: string
    code: string;
   };
   
   export class GoogleAuthenticationStrategy implements AuthenticationStrategy<GoogleAuthData> {
     readonly name = 'google';
     private client: OAuth2Client;
     private externalAuthenticationService: ExternalAuthenticationService;
   
     constructor(private clientId: string) {
       // The clientId is obtained by creating a new OAuth client ID as described
       // in the Google guide linked above.
       this.client = new OAuth2Client(clientId, "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", 'http://localhost:3001/login');
     }
   
     init(injector: Injector) {
       // The ExternalAuthenticationService is a helper service which encapsulates much
       // of the common functionality related to dealing with external authentication
       // providers.
       this.externalAuthenticationService = injector.get(ExternalAuthenticationService);
     }
   
     defineInputType(): DocumentNode {
       // Here we define the expected input object expected by the `authenticate` mutation
       // under the "google" key.
       return gql`
           input GoogleAuthInput {
             code: String!
           }
       `;
     }
   
     async authenticate(ctx: RequestContext, data: GoogleAuthData): Promise<User | false> {
      try{ 
          console.log("Code: ", data.code)
          const tokens = await this.client.getToken(data.code)
        //  console.log("Tokens", tokens.tokens)
          // Here is the logic that uses the token provided by the storefront and uses it
          // to find the user data from Google.
          
           const googleUser = await axios
          .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.tokens.access_token}`,
            {
              headers: {
                Authorization: `Bearer ${tokens.tokens.id_token}`,
              },
            },
          )
           .then(()=>{})
           .catch(error => {
             throw new Error(error.message);
        
           });
          //console.log(googleUser)
          const ticket = await this.client.verifyIdToken({
              idToken: tokens.tokens.id_token!,
              audience: this.clientId,
              
          });
        //  console.log("PASSED THE WALL")
          const payload = ticket.getPayload();
          console.log('attr', ticket.getAttributes())
          if (!payload || !payload.email) {
              return false;
          }
         // console.log("Authen ", payload)
          
          // First we check to see if this user has already authenticated in our
          // Vendure server using this Google account. If so, we return that
          // User object, and they will be now authenticated in Vendure.
          const user = await this.externalAuthenticationService.findCustomerUser(ctx, this.name, payload.sub);
          if (user) {
              console.log("Customer",user)
              return user;
          }
          
      
          // If no user was found, we need to create a new User and Customer based
          // on the details provided by Google. The ExternalAuthenticationService
          // provides a convenience method which encapsulates all of this into
          // a single method call.
          //  (async()=>
          //    console.log("h: ", await this.client.request({url:'https://www.googleapis.com/auth/userinfo.email'})))()
          const cus=  this.externalAuthenticationService.createCustomerAndUser(ctx, {
              strategy: this.name,
              externalIdentifier: payload.sub,
              verified: payload.email_verified || false,
              emailAddress: payload.email,
              firstName: payload.given_name || googleUser['given_name'],
              lastName: payload.family_name || googleUser['family_name'],
          });
          console.log("Customer",cus)
          return cus
          
        }
     
     catch(e){
       console.log(e)
     }
   }}