
import { Administrator, AuthenticatedSession, Customer, extractSessionToken, RequestContext } from '@etech/core';
import {getRepository} from 'typeorm';
import {Request} from 'express';

// @Injectable()
// export class InvoiceAccessGuard implements CanActivate {
//     constructor(private sessionService: SessionService, private configService: ConfigService){
    
//   }
  export async function getCurrentUser(
    req: Request,
    tokenMethod: "cookie" | "bearer" | readonly ("cookie" | "bearer")[]
  ): Promise<Administrator|Customer> {
    const sessionToken = extractSessionToken(req, tokenMethod);
    if(sessionToken){
        const sessionRepo= getRepository(AuthenticatedSession);
        const session= await sessionRepo.findOne({where:{token:sessionToken}, join:{
          alias: "session",
          leftJoinAndSelect:{
            user: 'session.user'
          }
        }, /*select:["user"]*/}); 
        if (session){
          const adminRepo= getRepository(Administrator);
          const admin= await adminRepo.findOne({where:{user: session.user}, select:["emailAddress","id","user"]})
          if(admin){
            return admin;
          }else{
            const customerRepo= getRepository(Customer);
            return await customerRepo.findOne({where: {user: session.user}, select:["emailAddress", "id","user"]})
          }
        }
      }
  }
// }
