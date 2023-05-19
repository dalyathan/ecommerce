import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { PaymentMethodActivityLogService } from '../services/payment-method-activity-log.service';

@Resolver()
export class PaymentMethodActivityLogResolver{

    constructor(private paymentMethodActivityLogger: PaymentMethodActivityLogService){}

    @Mutation()
    @Transaction()
    async revertPaymentMethodChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.paymentMethodActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deletePaymentMethodActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.paymentMethodActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async paymentMethodActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.paymentMethodActivityLogger.activityLogs(ctx);
    }
}