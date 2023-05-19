import { Injectable} from '@angular/core';
import {DataService, NotificationService} from '@etech/admin-ui/package/core';

import {CreateCms, GetCms, Type} from '../../generated-types';
import {GET_CMS} from "./cms-resolver.graphql";
import {CREATE_CMS} from "../../components/homepage/hompage.graphql";

@Injectable()
export class CmsResolver  {
    constructor(private dataService: DataService,
                private notificationService: NotificationService,
    ) {

    }


    getCms(type:Type[]){
         return this.dataService
            .query<GetCms.Query, GetCms.Variables>(GET_CMS, {Type: type })
            .mapSingle((data) => data.getCms)
    }
    
    updateCms(updateInput:any,entity:string){
        this.dataService.mutate<CreateCms.Mutation, CreateCms.Variables>(CREATE_CMS, {input: updateInput})
            .subscribe(
                (data) => {
                    this.notificationService.success('common.notify-update-success', {
                        entity: entity,
                    });
                },
                () => {
                    this.notificationService.error('common.notify-update-error', {
                        entity: entity,
                    });
                },
            );
    }

}
