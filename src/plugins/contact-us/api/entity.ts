
import { Entity, Column } from 'typeorm'
import { DeepPartial, EtechEntity } from '@etech/core'



@Entity()
export class ContactUsMessage extends EtechEntity{
    constructor(input?: DeepPartial<ContactUsMessage>) {
        super(input);
    }


    @Column()
    first_name: string
    @Column()
    last_name: string
    @Column()
    phone_number: string;

    @Column()
    email: string;

    @Column({length: 500})
    message: string;

    @Column({default: false})
    is_seen: boolean;

}