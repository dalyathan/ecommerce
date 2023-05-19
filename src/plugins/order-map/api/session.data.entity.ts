import { Channel, ChannelAware, DeepPartial, EtechEntity, Session } from "@etech/core"
import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
@Entity()
export class SessionData extends EtechEntity implements ChannelAware{
    constructor(input?: DeepPartial<SessionData>) {
        super(input);
      }
    
    channels: Channel[]

    @Column()
    ip: string

    @Column()
    userAgent: string

    @Column()
    latitude: string

    @Column()
    longtiude: string

    @OneToOne(()=> Session)
    @JoinColumn()
    session: Session;


}