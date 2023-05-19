import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { OrderRelatedActivityLogService } from '../services/order-related-activity-log.service';

@Resolver()
export class OrderRelatedActivityLogResolver{

    constructor(private orderRelatedActivityLogger: OrderRelatedActivityLogService){}

    @Mutation()
    @Transaction()
    async revertOrderRelatedChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.orderRelatedActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteOrderRelatedActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.orderRelatedActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async orderRelatedActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.orderRelatedActivityLogger.activityLogs(ctx,filter);
    }
}