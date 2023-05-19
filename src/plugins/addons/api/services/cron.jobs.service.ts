import { EventBus, TransactionalConnection, OrderService, 
    ProcessContext,
    GlobalSettingsEvent, Order, RequestContext, Channel, GlobalSettings } from '@etech/core';
import {
    Injectable,
    OnApplicationBootstrap,
  } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { UpdateBestSellersService } from './update-best-seller.service';
import { default as dayjs } from 'dayjs';
import {LessThanOrEqual,getRepository} from 'typeorm';
import { UpdateGlobalSettingsInput } from '../../generated-admin-types';
@Injectable()
export class CronJobsService implements OnApplicationBootstrap{
    EXPIRE_ORDERS_CRON_JOB_NAME='expire-order';
    UPDATE_BEST_SELLER_CRON_JOB_NAME='update-best-seller';
    constructor(
        private processContext: ProcessContext,
        private eventBus: EventBus, 
        private connection: TransactionalConnection,
        private schedulerRegistry: SchedulerRegistry,
        private updateBestSellersService: UpdateBestSellersService,
        private orderService: OrderService,
        ){
    }
    async onApplicationBootstrap():Promise<void> {
        if (this.processContext.isServer) {
            await this.initAllEtechCrons();
        }
    }

    async setupCancelActiveOrdersCron(){
        this.eventBus.ofType(GlobalSettingsEvent).subscribe(async ({ ctx, input }) => {
            // let cronJobName='expire-order';
            this.setUpUpdateableCron(this.EXPIRE_ORDERS_CRON_JOB_NAME,input.customFields.cancel_order_after,  
                async ()=>{
                    const allCtxs= await this.getChannelSpecificRequestContexts();
                    for(let channelCtx of allCtxs){
                        await this.cancelOrders(channelCtx, input.customFields.cancel_order_after);
                    }
                }
            )
        });
    }

    async setupUpdateBestSellerCron(){
        this.eventBus.ofType(GlobalSettingsEvent).subscribe(async ({ ctx, input }) => {
            this.setUpUpdateableCron(this.UPDATE_BEST_SELLER_CRON_JOB_NAME,input.customFields.update_best_sellers_every,  
                async ()=>{
                    await this.updateBestSellersService.goOverParentCollectionsAndUpdateBestSellers()
                }
            )
        });
    }

    async setUpUpdateableCron(cronJobName:string, timeInMinutes:number, whatTodoWhenTimeIsUp: Function){
        console.log('im in ',cronJobName,' scheduled for ',timeInMinutes)
        if(this.schedulerRegistry.doesExist("cron", cronJobName)){
            console.log('doesExist')
            let existingOne= this.schedulerRegistry.getCronJob(cronJobName);
            let existingNextTimes= existingOne.nextDates(2);
            let existingTimeInterval= dayjs(existingNextTimes[1].toJSDate()).diff(dayjs(existingNextTimes[0].toJSDate()))/60000;
            console.log(existingTimeInterval, timeInMinutes, ' compare' )
            if(existingTimeInterval != timeInMinutes){
                if(timeInMinutes==0){
                    console.log(`delete ${cronJobName}`)
                    this.schedulerRegistry.deleteCronJob(cronJobName);
                }else{
                    console.log(`update ${cronJobName} with time ${timeInMinutes}`, )
                    this.schedulerRegistry.deleteCronJob(cronJobName);
                    const newExpireCron= new CronJob(`0 */${timeInMinutes} * * * *`, ()=>{
                        console.log(`${cronJobName} is  runnning after being updated`)
                        whatTodoWhenTimeIsUp();
                    });
                    this.schedulerRegistry.addCronJob(cronJobName, newExpireCron);
                    newExpireCron.start();
                }
            }
        }else{
            if(timeInMinutes !=0){
                console.log(`${cronJobName} has never been setup before`)
                const newExpireCron= new CronJob(`0 */${timeInMinutes} * * * *`, ()=>{
                    whatTodoWhenTimeIsUp();
                });
                this.schedulerRegistry.addCronJob(cronJobName, newExpireCron);
                newExpireCron.start();
            }else{
                //this else is for debug purposes only 
                console.log(`${cronJobName} is still zero time`)        
            }
        }
        console.log('im out ',cronJobName)
    }

    async cancelOrders(ctx:RequestContext, minutes:number) {
        let now= new Date();
        let leastTimeToNotExpire= dayjs(now).subtract(minutes, 'minutes');
        let orderRepository= this.connection.getRepository(ctx, Order);
        let ordersAboutToExpire= await orderRepository.find({
            where:{
                state: 'AddingItems',
                createdAt: LessThanOrEqual(leastTimeToNotExpire.toDate().toJSON().slice(0, 19).replace('T', ' '))
            }
        })
        console.log(ordersAboutToExpire.length, ` orders in channel ${ctx.channel.code}, about to expire`)
        for(let order of ordersAboutToExpire){
            await this.orderService.cancelOrder(ctx, {orderId: order.id, cancelShipping: true, 
                reason: `Expired at ${now.toDateString()}` });
        }
    }

    async getChannelSpecificRequestContexts():Promise<RequestContext[]>{
        const allChannels= await getRepository(Channel).find();
        console.log(allChannels.map(c=> c.code))
        return allChannels.map((channel)=>new RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            channel,
          }));
    }

    async initAllEtechCrons(){
        const globalSettings= await getRepository(GlobalSettings).find();
        const cancelOrderAcrossAllChannels= async (input: UpdateGlobalSettingsInput | GlobalSettings)=>{
            const allCtxs= await this.getChannelSpecificRequestContexts();
            for(let channelCtx of allCtxs){
                await this.cancelOrders(channelCtx, globalSettings[0].customFields.cancel_order_after);
            }
        };
        const updateBestSellerAcrossAllChannels= async (input: UpdateGlobalSettingsInput | GlobalSettings)=>{
            const allCtxs= await this.getChannelSpecificRequestContexts();
            // for(let channelCtx of allCtxs){
                await this.updateBestSellersService.goOverParentCollectionsAndUpdateBestSellers()
            // }
        }
        const updateableCrons=(input: UpdateGlobalSettingsInput | GlobalSettings)=>{
            this.setUpUpdateableCron(
                this.UPDATE_BEST_SELLER_CRON_JOB_NAME,
                input.customFields.update_best_sellers_every,  
                ()=>updateBestSellerAcrossAllChannels(input)
            )
            this.setUpUpdateableCron(this.EXPIRE_ORDERS_CRON_JOB_NAME,
                input.customFields.cancel_order_after,  
                ()=>cancelOrderAcrossAllChannels(input)
            )
        }
        this.eventBus.ofType(GlobalSettingsEvent).subscribe(async ({ ctx, input }) => {
            console.log('--------new man-----------')
            updateableCrons(input);
        });
        // updateableCrons(globalSettings[0]);
    }
}
