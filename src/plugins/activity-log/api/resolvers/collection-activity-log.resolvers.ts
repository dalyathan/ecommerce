import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { CollectionActivityLogService } from '../services/collection-activity-log.service';
import { OrderRelatedActivityLogService } from '../services/order-related-activity-log.service';

@Resolver()
export class CollectionActivityLogResolver{

    constructor(private colletionActivityLogger: CollectionActivityLogService){}

    @Mutation()
    @Transaction()
    async revertCollectionChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.colletionActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteCollectionActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.colletionActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async collectionActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.colletionActivityLogger.activityLogs(ctx,filter);
    }
}