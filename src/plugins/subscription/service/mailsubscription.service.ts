import { Injectable, Inject } from '@nestjs/common';

import { ID, ListQueryBuilder,RequestContext,TransactionalConnection } from '@etech/core';

import { ListQueryOptions } from '@etech/core/dist/common/types/common-types';

import { MailSubscriptionEntity } from '../entities/mailsubscription.entity';
import { PLUGIN_INIT_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { DeepPartial, FindCondition, FindConditions, ObjectID } from 'typeorm';

@Injectable()
export class MailSubscriptionService {

    constructor(private connection: TransactionalConnection,
                @Inject(PLUGIN_INIT_OPTIONS) private options: PluginInitOptions,
				private listQueryBuilder: ListQueryBuilder) {}

    async getAllMails(ctx: RequestContext,options?: ListQueryOptions<MailSubscriptionEntity>) {
        return this.listQueryBuilder
		.build(MailSubscriptionEntity, options)
		.getManyAndCount()
		.then(([emails, totalItems]) => {
			return {
				items: emails,
				totalItems
			 };
		 });
    }
	
	async getMailById(ctx: RequestContext,data: any){
	   return this.connection.getEntityOrThrow(ctx,MailSubscriptionEntity, data);
	}
	
	async addSingleMail(ctx: RequestContext | undefined,data: DeepPartial<MailSubscriptionEntity>[]){
	   const createdVariant = await this.connection.getRepository(ctx,MailSubscriptionEntity).create(data);
	   const savedVariant = await this.connection.getRepository(ctx,MailSubscriptionEntity).save(createdVariant);
	   return Object(savedVariant).id;
	}
	
	async updateSingleMail(ctx: RequestContext | undefined,data: { id: string | number | Date | ObjectID | string[] | number[] | Date[] | ObjectID[] | FindConditions<MailSubscriptionEntity>; email: any; }){
	   const createdVariant = await this.connection.getRepository(ctx,MailSubscriptionEntity).update(data.id,{email:data.email});
	   return data.id;
	}
	
	async addMail(ctx: RequestContext | undefined,input: any){
	    const ids:string[] = [];
        for (const emailInput of input) {
            const id = await this.addSingleMail(ctx, emailInput);
            ids.push(id);
        }
        const createdVariants = await this.connection.getRepository(ctx,MailSubscriptionEntity).findByIds(ids);
		return createdVariants;
	}
	
	async updateMail(ctx: RequestContext | undefined,input: any){
	    const ids:any[] = [];
        for (const emailInput of input) {
            const id = await this.updateSingleMail(ctx, emailInput);
            ids.push(id);
        }
        const createdVariants = await this.connection.getRepository(ctx,MailSubscriptionEntity).findByIds(ids);
		return createdVariants;
	}
	
	async deleteMail(ctx: RequestContext | undefined,ids: any | number | any[] | Date | ObjectID | { email?: FindCondition<string> | undefined; id?: FindCondition<ID> | undefined; createdAt?: FindCondition<Date> | undefined; updatedAt?: FindCondition<Date> | undefined; }){
	   const Variants = await this.connection.getRepository(ctx,MailSubscriptionEntity).findByIds(ids);
	   this.connection.getRepository(ctx,MailSubscriptionEntity).delete(ids);
	   return Variants;
	}
	
	deleteAllMails(ctx: RequestContext | undefined){
	   this.connection.getRepository(ctx,MailSubscriptionEntity).clear();
	   return true;
	}
	
}
