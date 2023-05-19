import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { DELETE_PRICE_LIST_ACTIVITY_LOG, PRICE_LIST_ACTIVITY_LOGS, REVERT_PRICE_LIST_CHANGE } from '../../activity-log-resolver.graphql';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@etech/admin-ui/package/core';
import { ActivityLogActions } from '../actions';
@Component({
    selector: 'vdr-price-list-activity-log-list',
    template:`
    <vdr-activity-log-list [logs]="logs"
    (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
    ></vdr-activity-log-list>
    `
  })
export class PriceListActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,PRICE_LIST_ACTIVITY_LOGS,REVERT_PRICE_LIST_CHANGE,DELETE_PRICE_LIST_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from PriceListActivityLogListComponent')
        this.getList();
    }
}