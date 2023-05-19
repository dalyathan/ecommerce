import { RequestContext, TransactionalConnection } from "@etech/core";
import { Injectable } from "@nestjs/common";
import {getRepository} from 'typeorm'
import { Testimonial} from "./testimonials.model";


@Injectable()
export class TestimonialService{
    constructor(private connection: TransactionalConnection){

    }
    async getAllTestimonials(ctx: RequestContext){
          const repo = this.connection.getRepository(ctx,Testimonial);

          return repo.find();
    }
    async setTestimonialPicture(ctx: RequestContext,id: string, pic_loc: string): Promise<Testimonial[]>{
        const repo = this.connection.getRepository(ctx,Testimonial);
       
       const t = await repo.findOne({id})
       if(t === null) repo.find();

       t.pic_location = pic_loc;
       await repo.save(t);

       return repo.find()

    }
    async createTesimonial(ctx: RequestContext,name: string, pos: string, msg: string): Promise<Testimonial>{
        const repo = this.connection.getRepository(ctx,Testimonial);

        const newT = new Testimonial()

        newT.name = name;
        newT.msg = msg;
        newT.person_position = pos
        await repo.save(newT)


        return newT
    }
    async removeTestimonial(ctx: RequestContext,id:string) : Promise<Testimonial[]>{
        const repo = this.connection.getRepository(ctx,Testimonial);

        const t = await repo.findOne({id});
        await repo.remove(t);
        return repo.find();
    }
}