import {Injectable} from '@nestjs/common'
import { InstantMessage } from './instant-message.entity'
import {getRepository, Repository} from 'typeorm'
import { EventBus, RequestContext, TransactionalConnection,ShowNotificationEvent } from '@etech/core';
import { Success } from '@etech/admin-ui/package/core';



@Injectable()
export class InstantMessageService{
     constructor(private connection: TransactionalConnection, private eventBus: EventBus){

     }
       async writeInstantMessage(msg: string, userEmail: string,isFromAdmin: boolean = false, 
            firstName: string='', lastName: string ='', ctx: RequestContext): Promise<InstantMessage>{
            const repo = getRepository(InstantMessage);
            const ipAndBrowser= this.calculateUserIdentifier(ctx);
            const previousLog= await this.getFullNameWithIpGuestMode(ctx);
            let savedInstantMessage;
          //   if(isFromAdmin){
          //      savedInstantMessage= repo.save({msg, userEmail:'', isFromAdmin, firstName, lastName,ipAndBrowser: ipAndBrowser});
          //   }
          if(userEmail===''){
                 //Guest Mode
               if(previousLog){
                    firstName=  previousLog.firstName;
                    lastName= previousLog.lastName;
               }else{
                    firstName=`user${Math.floor(Math.random() * 100000000)}`
                    lastName= '(Guest)'
               }
               savedInstantMessage= repo.save({msg, userEmail:ipAndBrowser, isFromAdmin, firstName, lastName});
          }else{
               savedInstantMessage= repo.save({msg, userEmail, isFromAdmin, firstName, lastName});
          }
            if(!isFromAdmin){
               //   if(userEmail!==''){
                    this.eventBus.publish(
                         new ShowNotificationEvent(ctx, msg, 
                              `./extensions/instantmessages`,`${firstName} ${lastName}`,
                              undefined, 30000, 'user',{email: encodeURIComponent(userEmail)}))
                    // }else{
                    //      this.eventBus.publish(
                    //           new ShowNotificationEvent(ctx, msg, 
                    //                `./extensions/instantmessages`,`${firstName} ${lastName}`,
                    //                undefined, 30000, 'user',{ipAndBrowser: encodeURIComponent(ipAndBrowser)}))
                    // }
            }   
            return savedInstantMessage;
       }

       async getAllInstantMessages(ctx: RequestContext): Promise<InstantMessage[]>{
             const repo = getRepository(InstantMessage);
             return await repo.find(/*{order:{createdAt:'DESC'}}*/);
       }

       async getUserInstantMessages(userEmail: string,ctx: RequestContext): Promise<InstantMessage[]>{
               const repo = getRepository(InstantMessage);
               if(userEmail !== ''){
                    return repo.find({userEmail});
               }
               const ipAndBrowser= this.calculateUserIdentifier(ctx);
               return await repo.find({userEmail:ipAndBrowser});
       }

       async getFullNameWithIpGuestMode(ctx: RequestContext): Promise<{ firstName: string; lastName: string; }|undefined>{
          const repo = getRepository(InstantMessage);
          const ipAndBrowser= this.calculateUserIdentifier(ctx);
          const oneItem= await repo.findOne({userEmail:ipAndBrowser},{select:['firstName', 'lastName','userEmail']})
          if(oneItem){
               return {firstName: oneItem.firstName,lastName: oneItem.lastName}
          }
       }

       async makeSeenByAdmin(ids:string[],ctx: RequestContext): Promise<Success>{
            const repo = getRepository(InstantMessage);
            const msgs = await repo.findByIds(ids);
            for(const msg of msgs){
                 msg.isSeen = true;
                 if(msg.isFromAdmin){
                    console.log('message from admin is being make seen by admin')
               }
            }
            await repo.save(msgs);
            return {success: true};
       }

       async makeSeenByUser(ids:string[],ctx: RequestContext): Promise<Success>{
          const repo = getRepository(InstantMessage);
          const msgs = await repo.findByIds(ids);
          for(const msg of msgs){
               msg.isSeen= true;
               if(!msg.isFromAdmin){
                    console.log('message from user is being make seen by user')
               }
          }
          await repo.save(msgs);
          return {success: true};
     }

       calculateUserIdentifier(ctx: RequestContext):string{
          const userIp= ctx.req.headers['x-forwarded-for']
          // console.log(ctx.req.ip,'ctx.req.ip');
          // console.log(ctx.req.headers['x-forwarded-for'],'ctx.req.headers[x-forwarded-for]');
          // console.log(ctx.req.connection.remoteAddress,'ctx.req.connection.remoteAddress');
          return (userIp??'')+' '+ctx.req.headers['user-agent'];
       }
}

