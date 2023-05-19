import { RequestContext, Tag, TransactionalConnection } from "@etech/core";
import { TagService } from "@etech/core/dist/service/services/tag.service";
import { Injectable } from "@nestjs/common";
import {FaqInputType,FaqType} from './ui/generated-admin-types';
import { Faq } from "./faq.model";
import {FindManyOptions} from 'typeorm';


@Injectable()
export class FaqService{
    tagsFindMany:FindManyOptions<Faq>= {join:{
        alias:'faq',
        leftJoinAndSelect:{
            tags: 'faq.tags'
        }
    }};
    constructor(private connection:TransactionalConnection,private tagService: TagService){

    }
    
    async getFaqs(ctx: RequestContext, tags?:string[]):Promise<FaqType[]>{
        const repo = this.connection.getRepository(ctx, Faq);
        let valuesQuqery=
         repo.createQueryBuilder('faq')
        .leftJoin('faq.tags','tag')
        .addSelect('tag.value');
        if(tags){
            valuesQuqery=valuesQuqery.andWhere('tag.value IN(:...tags)',{tags: tags});
        }
        const finalValue= await valuesQuqery.getMany(); 
        return finalValue.map((v)=> {return {...v, tags: v.tags.map((b)=> b.value)};});
    }

    async faqTags(ctx: RequestContext,):Promise<string[]>{
        const repo = this.connection.getRepository(ctx, Faq);
        let valuesQuqery= await
        repo.createQueryBuilder('faq')
        .leftJoin('faq.tags','tag')
        .addSelect('tag.value')
        .getMany();
        return valuesQuqery.map((v)=> v.tags.map((v)=> v.value)).flat();
    }

    async createFaq(
        ctx: RequestContext,
        faqInput: FaqInputType
    ): Promise<FaqType>{
        let repo = this.connection.getRepository(ctx, Faq);
        const faq = new Faq();
        faq.answer = faqInput.answer;
        faq.question = faqInput.question;
        faq.isEnabled= true;
        faq.tags= await this.tagService.valuesToTags(ctx, faqInput.tags);

        const value=await repo.save(faq)
        return {...value, tags: value.tags.map((b)=> b.value)};
    }

    async updateFaq(ctx: RequestContext,id: any, 
                   newFaq: FaqInputType): Promise<FaqType>{
        let repo = this.connection.getRepository(ctx, Faq);
        const faq = await repo.findOne(id,this.tagsFindMany)
        
        if(!faq) return null;

        faq.answer = newFaq.answer;
        faq.question = newFaq.question;
        faq.tags= await this.tagService.valuesToTags(ctx, newFaq.tags);

        const value=await repo.save(faq);
        // console.log(value)
        return {...value, tags: value.tags.map((b)=> b.value)};
    }

    async deleteFaq(ctx: RequestContext,id: any): Promise<FaqType>{
        let repo = this.connection.getRepository(ctx, Faq);
        const faq = await repo.findOne(id,this.tagsFindMany);

        if(!faq) return null;
        const value=await repo.delete(faq.id);
        return {...faq, tags: faq.tags.map((b)=> b.value)};
    }

    async disableFaq(ctx: RequestContext,id: any): Promise<FaqType>{
        let repo = this.connection.getRepository(ctx, Faq);
        const faq = await repo.findOne(id, this.tagsFindMany);
        if(!faq) return null;
        faq.isEnabled = false;
        const value=await repo.save(faq)
        return {...value, tags: value.tags.map((b)=> b.value)};

    }
    
    async enableFaq(ctx: RequestContext,id: any): Promise<FaqType>{
        let repo = this.connection.getRepository(ctx, Faq);
        const faq = await repo.findOne(id,this.tagsFindMany);
        if(!faq) return null;
        faq.isEnabled = true;
        const value=await repo.save(faq)
        return {...value, tags: value.tags.map((b)=> b.value)};
    }
}