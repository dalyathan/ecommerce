import { ChannelService, EventBus, OrderPlacedEvent, ProcessContext, Session, SessionService, TransactionalConnection } from '@etech/core';
import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import { SessionData } from './session.data.entity';

@Injectable()
export class OrderPlacedAtEventListener implements OnApplicationBootstrap{
    constructor(private eventBus: EventBus, 
        private conn: TransactionalConnection,
        private sessionService: SessionService,
        private channelService: ChannelService,
        private processContext: ProcessContext){

    }
    onApplicationBootstrap() {
        if(this.processContext.isServer){
            this.eventBus.ofType(OrderPlacedEvent).subscribe(async (event)=>{
                var geoip = require('geoip-lite');
                const ipSessionRepo= this.conn.getRepository(event.ctx, SessionData);
                const sessionRepo= this.conn.getRepository(event.ctx, Session);
                // const sessionId= event.ctx.session.id;
                const sessionIp = new SessionData();
                sessionIp.channels=[await this.channelService.findOne(event.ctx, event.ctx.channelId)]
                sessionIp.session=await sessionRepo.findOne(event.ctx.session.id);
                sessionIp.ip= event.ctx.req.headers['x-forwarded-for'][0] || event.ctx.req.socket.remoteAddress;
                if(sessionIp.ip){
                    var geo = geoip.lookup(sessionIp.ip);
                }
                sessionIp.userAgent=  event.ctx.req.headers['user-agent'];
                await ipSessionRepo.save(sessionIp);
            });
        }
    }
}