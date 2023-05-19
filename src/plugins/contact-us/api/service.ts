import {Injectable} from '@nestjs/common'
import { ContactUsMessage } from './entity';
import { ID, RequestContext, TransactionalConnection } from '@etech/core';
import { EmailService } from '../../addons/api/services/email.service';
@Injectable()
export class ContactUsService{
    constructor(private connection:TransactionalConnection,
        private emailService: EmailService){

    }
 
    async getMessage(ctx: RequestContext, id: string): Promise<ContactUsMessage| undefined> {
        let repo = this.connection.getRepository(ctx, ContactUsMessage);
        return await repo.findOne({id})
    }
    async getAllMessages(ctx: RequestContext): Promise<ContactUsMessage[] | undefined>{
        let repo = this.connection.getRepository(ctx, ContactUsMessage);
        return await repo.find();
    }
    async addMessage(ctx: RequestContext,firstName: string, lastName: string, phoneNumber: string, email: string, message: string): Promise<ContactUsMessage>{
        // sendEmail('ebenezertesfaye@yahoo.com', 'Contact Us Message From Ethio Labs',
        //                     `From Phone Number: ${phoneNumber} <br />`+
        //                     `From Email: ${email} <br />` +
        //                     `Sender Name ${firstName} ${lastName} <br /><br /> <br />` + 
        //                      `Message:    <b>${message}</b> <br />`)
        await this.emailService.sendMail(email, 
            'Contact Us Message From Ethio Labs', 
            `From Phone Number: ${phoneNumber} <br />`+
                            `From Email: ${email} <br />` +
                            `Sender Name ${firstName} ${lastName} <br /><br /> <br />` + 
                             `Message:    <b>${message}</b> <br />`);
    let repo = this.connection.getRepository(ctx, ContactUsMessage);
       const msg = new ContactUsMessage();
       msg.email = email;
       msg.first_name=  firstName;
       msg.last_name = lastName;
       msg.message = message;
       msg.phone_number = phoneNumber;
       const resposne = await repo.save(msg);
       return resposne;
    }
    async deleteMessage(ctx: RequestContext,id: string): Promise<ID>{
        let repo = this.connection.getRepository(ctx, ContactUsMessage);
       const msg = await this.getMessage(ctx,id);
       if(!msg) return;
        
       await repo.delete(msg);
       return msg.id;

    }
    async makeMessageSeen(ctx: RequestContext,id: string): Promise<ContactUsMessage>{
        let repo = this.connection.getRepository(ctx, ContactUsMessage);
        const msg = await this.getMessage(ctx,id)
        if(!msg) return;
        msg.is_seen = true;
        return await repo.save(msg);
    }
}