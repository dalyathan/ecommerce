import { Injectable, Inject } from '@nestjs/common';

import { ListQueryBuilder,TransactionalConnection, RequestContext, ID } from '@etech/core';

import { ListQueryOptions } from '@etech/core/dist/common/types/common-types';

import { PhoneSubscriptionEntity } from '../entities/phonesubscription.entity';
import { PLUGIN_INIT_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { DeepPartial, FindCondition, FindConditions, ObjectID } from 'typeorm';

@Injectable()
export class PhoneSubscriptionService {

    constructor(private connection: TransactionalConnection,
                @Inject(PLUGIN_INIT_OPTIONS) private options: PluginInitOptions,
				private listQueryBuilder: ListQueryBuilder) {}

    async getAllPhones(ctx: RequestContext,options?: ListQueryOptions<PhoneSubscriptionEntity>) {
        return this.listQueryBuilder
		.build(PhoneSubscriptionEntity, options)
		.getManyAndCount()
		.then(([phones, totalItems]) => {
			return {
				items: phones,
				totalItems
			 };
		 });
    }
	
	async getPhoneById(ctx: RequestContext,data: ID){
	   return this.connection.getEntityOrThrow(ctx,PhoneSubscriptionEntity, data);
	}
	
	async addSinglePhone(ctx: RequestContext | undefined,data: DeepPartial<PhoneSubscriptionEntity>[]){
	   const createdVariant = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).create(data);
	   const savedVariant = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).save(createdVariant);
	   return Object(savedVariant).id;
	}
	
	async updateSinglePhone(ctx: RequestContext | undefined,data: { id: string | number | Date | ObjectID | string[] | number[] | Date[] | ObjectID[] | FindConditions<PhoneSubscriptionEntity>; phone: any; }){
	   const createdVariant = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).update(data.id,{phone:data.phone});
	   return data.id;
	}
	
	async addPhone(ctx: RequestContext | undefined,input: any){
	    const ids:string[] = [];
        for (const phoneInput of input) {
            const id = await this.addSinglePhone(ctx, phoneInput);
            ids.push(id);
        }
        const createdVariants = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).findByIds(ids);
		return createdVariants;
	}
	
	async updatePhone(ctx: RequestContext | undefined,input: any){
	    const ids:any[] = [];
        for (const phoneInput of input) {
            const id = await this.updateSinglePhone(ctx, phoneInput);
            ids.push(id);
        }
        const createdVariants = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).findByIds(ids);
		return createdVariants;
	}
	
	async deletePhone(ctx: RequestContext | undefined,ids:any | { phone?: FindCondition<string> | undefined; id?: FindCondition<ID> | undefined; createdAt?: FindCondition<Date> | undefined; updatedAt?: FindCondition<Date> | undefined; }){
	   const Variants = await this.connection.getRepository(ctx,PhoneSubscriptionEntity).findByIds(ids);
	   this.connection.getRepository(ctx,PhoneSubscriptionEntity).delete(ids);
	   return Variants;
	}
	
	deleteAllPhones(ctx: RequestContext | undefined){
	   this.connection.getRepository(ctx,PhoneSubscriptionEntity).clear();
	   return true;
	}
	
}
