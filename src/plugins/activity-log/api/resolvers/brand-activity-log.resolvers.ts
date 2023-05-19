import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { BrandActivityLogService } from '../services/brand-activity-log.service';

@Resolver()
export class BrandActivityLogResolver{

    constructor(private brandActivityLogger: BrandActivityLogService){}

    @Mutation()
    @Transaction()
    async revertBrandChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.brandActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteBrandActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.brandActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async brandActivityLogs(@Ctx() ctx:RequestContext,  @Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.brandActivityLogger.activityLogs(ctx, filter);
    }
}