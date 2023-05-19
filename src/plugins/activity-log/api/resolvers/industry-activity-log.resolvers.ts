import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { IndustryActivityLogService } from '../services/industry-activity-log.service';
import { ProductRelatedActivityLogService } from '../services/product-related-activity-log.service';

@Resolver()
export class IndustryActivityLogResolver{

    constructor(private industryActivityLogger: IndustryActivityLogService){}

    @Mutation()
    @Transaction()
    async revertIndustryChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.industryActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteIndustryActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.industryActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async industryActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.industryActivityLogger.activityLogs(ctx,filter);
    }
}