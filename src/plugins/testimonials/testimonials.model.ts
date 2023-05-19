import { DeepPartial, EtechEntity } from '@etech/core';
import {Entity, Column, CreateDateColumn} from 'typeorm'

@Entity({name: 'testimonial'})
export class Testimonial extends EtechEntity{


    constructor(input?: DeepPartial<Testimonial>) {
     super(input);
   }

     @Column({default: ''})
     pic_location: string;


     @Column({default: ''})
     msg: string;

     @Column({default: ''})
     name: string
     
     @Column({default: ''})
     person_position: string;

}