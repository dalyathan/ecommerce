import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { ProductRelatedActivityLogService } from '../services/product-related-activity-log.service';

@Resolver()
export class ProductRelatedActivityLogResolver{

    constructor(private productActivityLogger: ProductRelatedActivityLogService){}

    @Mutation()
    @Transaction()
    async revertProductChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.productActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deleteProductActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.productActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async productActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.productActivityLogger.activityLogs(ctx,filter);
    }
}