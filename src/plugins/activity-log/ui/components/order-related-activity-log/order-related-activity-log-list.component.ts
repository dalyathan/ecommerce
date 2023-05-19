import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { ORDER_ACTIVITY_LOGS, REVERT_ORDER_RELATED_CHANGE, DELETE_ORDER_RELATED_ACTIVITY_LOG } from '../../activity-log-resolver.graphql';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@etech/admin-ui/package/core';
import { ActivityLogActions } from '../actions';
@Component({
    selector: 'vdr-order-related-activity-log-list',
    template:`
    <vdr-activity-log-list [logs]="logs"
    (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
    ></vdr-activity-log-list>
    `
  })
export class OrderRelatedActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,ORDER_ACTIVITY_LOGS,REVERT_ORDER_RELATED_CHANGE,DELETE_ORDER_RELATED_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from OrderRelatedActivityLogListComponent')
        this.getList();
    }
}