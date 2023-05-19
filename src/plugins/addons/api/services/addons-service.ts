import { Administrator, AdministratorService, EventBus, ProcessContext,
    OrderService, FulfillmentStateTransitionEvent, RefundStateTransitionEvent, 
    TransactionalConnection, PasswordResetEvent, Order } from '@etech/core';
import {
    Injectable,
    OnModuleInit,
  } from '@nestjs/common';
import { AdministratorCustomFields } from 'src/ui/generated/graphql';
import { EmailService } from './email.service';

@Injectable()
export class AddonsService  implements OnModuleInit{
    constructor(
        private processContext: ProcessContext,
        private eventBus: EventBus, 
        private adminService: AdministratorService,
        private connection: TransactionalConnection,
        private emailService: EmailService,
        private orderService: OrderService,
        private transactionalConnection: TransactionalConnection
        ){
    }
    onModuleInit() {
        if (this.processContext.isServer) {
            this.assignOrRemoveOrdersToAdmins();
            this.assignRefundsToAdmins();
            this.sendEmailOnPasswordReset();
        }
    }

    async sendEmailOnPasswordReset(){
        this.eventBus.ofType(PasswordResetEvent).subscribe(async ({ctx, createdAt, user})=>{
            const nativeAuthMethod = user.getNativeAuthenticationMethod();
            if(!nativeAuthMethod || !nativeAuthMethod.passwordResetToken){
                throw Error('Password reset token not set')
            }
            this.emailService.sendMail(user.identifier,'Reset your password',`Please reset your 
            password using the token ${nativeAuthMethod.passwordResetToken}`)
        });
    }

    async assignOrRemoveOrdersToAdmins(){
        this.eventBus.ofType(FulfillmentStateTransitionEvent).subscribe(async ({ ctx, fulfillment,fromState,toState }) => {
            if(toState === 'Delivered'){
                const orderRepo= this.transactionalConnection.getRepository(ctx, Order);
                const order= await orderRepo.findOne({where:{lines:{id: fulfillment.orderItems[0].lineId}, /*select:['id','lines']*/}});
                const adminRepo= this.transactionalConnection.getRepository(ctx, Administrator);
            const currentAdmin= await adminRepo.findOne({where:{user:{id: ctx.activeUserId}}, /*select:['id', 'customFields','user']*/});
                const listOfFulfillments= currentAdmin.customFields.fulfillments;
                if(listOfFulfillments && listOfFulfillments !== '' && listOfFulfillments !== null){
                    const listVersion= listOfFulfillments.split(',');
                    listVersion.push(order.id.toString());
                    currentAdmin.customFields.fulfillments= listVersion.join(',');
                }else{
                    currentAdmin.customFields.fulfillments= order.id.toString();
                }
                const updated= await adminRepo.save(currentAdmin);
                if(updated.customFields.fulfillments){
                    if(!updated.customFields.fulfillments.split(',').includes(order.id.toString())){
                        throw Error(`Couldn't assign order to admin`)
                    }
                    return;
                }
                throw Error(`Couldn't assign order to admin`)
            }
            if(toState === 'Cancelled'){
                const orderRepo= this.transactionalConnection.getRepository(ctx, Order);
                const order= await orderRepo.findOne({where:{lines:{id: fulfillment.orderItems[0].lineId}, 
                    // select:['id','lines']
                }});
                const adminRepo= this.transactionalConnection.getRepository(ctx, Administrator);
                const currentAdmin= await adminRepo.findOne({where:{user:{id: ctx.activeUserId}},
                    //  select:['id', 'customFields','user']
                    });
                let listOfFulfillments= currentAdmin.customFields.fulfillments;
                if(listOfFulfillments && listOfFulfillments.length && listOfFulfillments !== '' && listOfFulfillments !== null){
                    const listVersion= listOfFulfillments.split(',');
                    const updated= listVersion.filter((value)=> value!== order.id.toString());
                    currentAdmin.customFields.fulfillments= updated.join(',');
                }
                let updated= await adminRepo.save(currentAdmin);
                if(updated.customFields.fulfillments.length){
                    if(updated.customFields.fulfillments.split(',').includes(order.id.toString())){
                        throw Error(`Couldn't cancel order from admin`)
                    }
                    return;
                }
            }
        });
    }

    async assignRefundsToAdmins(){
        this.eventBus.ofType(RefundStateTransitionEvent).subscribe(async ({ ctx, refund,fromState,toState }) => {
            if(toState === 'Settled'){
                const adminRepo= this.transactionalConnection.getRepository(ctx, Administrator);
                const currentAdmin= await adminRepo.findOne({where:{user:{id: ctx.activeUserId}},
                    //  select:['id', 'customFields','user']
                    });
                const listOfRefunds= currentAdmin.customFields.refunds;
                if(listOfRefunds && listOfRefunds !== '' && listOfRefunds !== null){
                    let listVersion= listOfRefunds.split(',');
                    listVersion.push(refund.id.toString());
                    currentAdmin.customFields.refunds= listVersion.join(',');
                }else{
                    currentAdmin.customFields.refunds= refund.id.toString();
                }
                let updated= await adminRepo.save(currentAdmin);
                if(updated.customFields.refunds){
                    if(!updated.customFields.refunds.split(',').includes(refund.id.toString())){
                        throw Error(`Couldn't assign refund to admin`)
                    }
                    return;
                }
                throw Error(`Couldn't assign refund to admin`)
            }
        });
    }
}