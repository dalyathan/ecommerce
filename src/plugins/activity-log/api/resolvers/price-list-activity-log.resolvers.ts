import { Ctx, ID, RequestContext, Transaction} from '@etech/core'
import { Resolver, Query,Args, Mutation } from '@nestjs/graphql';
import { ActivityLog, ActivityLogFilter } from '../../ui/generated-admin-types';
import { PriceListActivityLogService } from '../services/price-list-activity-log.service';

@Resolver()
export class PriceListActivityLogResolver{

    constructor(private priceListActivityLogger: PriceListActivityLogService){}

    @Mutation()
    @Transaction()
    async revertPriceListChanges(@Ctx() ctx:RequestContext, @Args('id') id:ID):Promise<Boolean>{
        return this.priceListActivityLogger.revertChanges(ctx, id);
    }

    @Mutation()
    @Transaction()
    async deletePriceListActivityLog(@Ctx() ctx:RequestContext, @Args('id') id: ID): Promise<Boolean>{
        return await this.priceListActivityLogger.deleteActivityLog(ctx, id);
    }

    @Query()
    async priceListActivityLogs(@Ctx() ctx:RequestContext,@Args('filter') filter: ActivityLogFilter):Promise<ActivityLog[]>{
        return await this.priceListActivityLogger.activityLogs(ctx,filter);
    }
}