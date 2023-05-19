import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { PAYMENT_METHOD_ACTIVITY_LOGS, REVERT_PAYMENT_METHOD_CHANGE, 
    DELETE_PAYMENT_METHOD_ACTIVITY_LOG } from '../../activity-log-resolver.graphql';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@etech/admin-ui/package/core';
import { ActivityLogActions } from '../actions';
@Component({
    selector: 'vdr-payment-method-activity-log-list',
    template:`
    <vdr-activity-log-list [logs]="logs"
    (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
    ></vdr-activity-log-list>
    `
  })
export class PaymentMethodActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,PAYMENT_METHOD_ACTIVITY_LOGS,
            REVERT_PAYMENT_METHOD_CHANGE,DELETE_PAYMENT_METHOD_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from PaymentMethodActivityLogListComponent')
        this.getList();
    }
}