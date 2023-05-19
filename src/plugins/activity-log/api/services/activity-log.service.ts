import { EtechEntity, EtechEvent, EventBus, ID, ProcessContext, ProductEvent, RequestContext } from '@etech/core';
import {
    Injectable,
    OnApplicationBootstrap,
  } from '@nestjs/common';
import { ActivityLogFilter } from '../../ui/generated-admin-types';
import {SelectQueryBuilder} from 'typeorm';
@Injectable()
export abstract class ActivityLogService<T extends EtechEvent>  implements OnApplicationBootstrap{
    abstract onApplicationBootstrap();
    abstract registerLog(event: T);
    abstract revertChanges(ctx:RequestContext, id:ID):Promise<Boolean>
    abstract activityLogs(ctx: RequestContext):Promise<any[]>;
    abstract deleteActivityLog(ctx:RequestContext, id:ID):Promise<Boolean>;

    addFilterToQueryBuilder(queryBuilder: SelectQueryBuilder<any>, filter: ActivityLogFilter):SelectQueryBuilder<any>{
      if(filter){
        if(filter.createdAt){
          if(filter.createdAt.before){
            queryBuilder= queryBuilder.where(
                  `log.createdAt
                BETWEEN :begin
                   AND :end`,
                  {
                    begin: new Date(0,0,0).toISOString(),
                    end: filter.createdAt.before,
                  }
                )
          }else if(filter.createdAt.after){
            queryBuilder= queryBuilder.where(
                  `log.createdAt
                BETWEEN :begin
                   AND :end`,
                  {
                    begin: filter.createdAt.after,
                    end: new Date().toISOString(),
                  }
                )
          }else if(filter.createdAt.between){
            queryBuilder= queryBuilder.where(
                  `log.createdAt
                BETWEEN :begin
                   AND :end`,
                  {
                    begin: filter.createdAt.between.start,
                    end: filter.createdAt.between.end,
                  }
                )
          }else{
            //no condition, suppose to be empty object
            if(Object.keys(filter.createdAt).length !== 0){
              console.log('Unexpected purchased');
            }
          }
        }
        if(filter.adminIds && filter.adminIds.length){
          queryBuilder= queryBuilder
          .andWhere("log.adminId IN(:...ids)", { ids: filter.adminIds })
        }
      }
      return queryBuilder;
    }
}