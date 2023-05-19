import { ChangeDetectorRef} from '@angular/core';
import {DocumentNode} from '@apollo/client';
import { NotificationService } from '@etech/admin-ui/package/core';
import { Apollo } from 'apollo-angular';
import { ID, } from '@etech/core';
import { ActivityLog, ActivityLogFilter } from '../generated-admin-types';
import {take} from 'rxjs/operators';
export class ActivityLogActions{
    logs: ActivityLog[]=[];
    currentPage: number =1;
    itemsPerPage: number=10;
    constructor(
        private cdr: ChangeDetectorRef, 
        private ns: NotificationService,
        private dataService: Apollo,
        private logQueryDocumentNode: DocumentNode,
        private revertChangesDocumentNode: DocumentNode,
        private deleteLogDocumentNode: DocumentNode){

        }

        setPage(event:number){
            this.currentPage= event;
        }
      
        setItemsPerPage(event:number){
            this.itemsPerPage= event;
        }

        async getList(filter?: ActivityLogFilter){
            this.dataService.watchQuery({query:this.logQueryDocumentNode, variables:{
                filter: filter
            }}).valueChanges.subscribe((({data,loading})=>
                {
                        if(!loading){
                            // console.log(data);
                            const anyData= data as any;
                            this.logs= anyData[Object.keys(anyData)[0]] as unknown as ActivityLog[] ?? [];
                            this.cdr.detectChanges();
                        }
                }));
            
        }
    
        async revertChanges(logId: ID){
            let result= await this.dataService.mutate<any>({
                mutation: this.revertChangesDocumentNode,
                variables: {
                    id: logId
                },
                }).toPromise();
            // console.log(result);
        }
    
        async deleteActivityLog(logId: ID){
            let result= await this.dataService.mutate<any>({
                mutation: this.deleteLogDocumentNode,
                variables: {
                    id: logId
                },
                }).toPromise();
            var obj = result.data;
            if(obj[Object.keys(obj)[0]] as boolean){
                this.logs= this.logs.filter((item)=> item.id != logId);
                this.cdr.detectChanges();
                this.ns.success('Log Successfully deleted')
            }else{
                this.ns.success('Unable to delete log')
            }
        }
}