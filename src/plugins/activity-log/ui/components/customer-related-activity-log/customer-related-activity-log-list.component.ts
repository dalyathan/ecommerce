import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@etech/admin-ui/package/core';
import {CUSTOMER_RELATED_ACTIVITY_LOGS, REVERT_CUSTOMER_RELATED_CHANGE, DELETE_CUSTOMER_RELATED_ACTIVITY_LOG} from '../../activity-log-resolver.graphql';
import {ActivityLogActions} from '../actions';
@Component({
    selector: 'vdr-customer-related-activity-log-list',
    template:`
    <vdr-activity-log-list [logs]="logs" 
        (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
    ></vdr-activity-log-list>
    `
  })
export class CustomerRelatedActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,CUSTOMER_RELATED_ACTIVITY_LOGS,REVERT_CUSTOMER_RELATED_CHANGE,DELETE_CUSTOMER_RELATED_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from CustomerRelatedActivityLogListComponent')
        this.getList();
    }
}