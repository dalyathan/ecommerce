import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { CustomerRelatedActivityLogService } from '../services/customer-related-activity-log.service';

@Resolver()
export class CustomerRelatedActivityLogResolver{

    constructor(private customerRelatedActivityLogger: CustomerRelatedActivityLogService){}

    @Mutation()
    @Transaction()
    async revertCustomerRelatedChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.customerRelatedActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteCustomerRelatedActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.customerRelatedActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async customerRelatedActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.customerRelatedActivityLogger.activityLogs(ctx,filter);
    }
}