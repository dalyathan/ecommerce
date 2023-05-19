import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { ShippingMethodActivityLogService } from '../services/shipping-method-activity-log.service';

@Resolver()
export class ShippingMethodActivityLogResolver{

    constructor(private shippingMethodActivityLogger: ShippingMethodActivityLogService){}

    @Mutation()
    @Transaction()
    async revertShippingMethodChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.shippingMethodActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteShippingMethodActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.shippingMethodActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async shippingMethodActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.shippingMethodActivityLogger.activityLogs(ctx,filter);
    }
}