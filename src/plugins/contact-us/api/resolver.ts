import { Allow, Ctx, ID, RequestContext, Transaction } from '@etech/core';
import { Args, Mutation, Resolver , Query} from '@nestjs/graphql';
import { contactUsPermissionDefinition } from '../';
import { ContactUsMessage } from './entity';
import { ContactUsService } from './service';

@Resolver()
export class ContactUsResolver{
    
    constructor(private contactUsService: ContactUsService){}

    @Mutation()
    @Transaction()
    async   writeContactUsMessage(@Ctx() ctx: RequestContext,@Args() arg:{message: {firstName: string, lastName: string, phoneNumber: string, email: string, message: string}}): Promise<ContactUsMessage>{
        return await this.contactUsService.addMessage(ctx,arg.message.firstName, arg.message.lastName, 
                                arg.message.phoneNumber, arg.message.email, arg.message.message)
    }

    @Mutation()
    @Transaction()
    @Allow(contactUsPermissionDefinition.Update)
    async makeContactUsMessageSeen(@Ctx() ctx: RequestContext,@Args('id') id: string): Promise<ContactUsMessage>{
        return this.contactUsService.makeMessageSeen(ctx,id);
    }

    @Mutation()
    @Transaction()
    @Allow(contactUsPermissionDefinition.Delete)
    async deleteContactUsMessage(@Ctx() ctx: RequestContext,@Args('id') id: string): Promise<ID>{
        return this.contactUsService.deleteMessage(ctx,id);
    }

    @Query()
    async getContactUsMessage(@Ctx() ctx: RequestContext,@Args('id') id: string): Promise<ContactUsMessage | undefined>{
        return this.contactUsService.getMessage(ctx,id);
    }
    
    @Query()
    async getAllContactUsMessages(@Ctx() ctx: RequestContext,@Args('id') id: string): Promise<ContactUsMessage[] | undefined>{
        return this.contactUsService.getAllMessages(ctx);
    }
}