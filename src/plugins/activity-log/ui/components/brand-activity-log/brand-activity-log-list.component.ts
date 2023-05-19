import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { NotificationService } from '@etech/admin-ui/package/core';
import {BRAND_ACTIVITY_LOGS, REVERT_BRAND_CHANGE, DELETE_BRAND_ACTIVITY_LOG} from '../../activity-log-resolver.graphql';
import {ActivityLogActions} from '../actions';
@Component({
    selector: 'vdr-brand-activity-log-list',
    template:`
    <vdr-activity-log-list [logs]="logs" 
        (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
    ></vdr-activity-log-list>
    `
  })
export class BrandActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,BRAND_ACTIVITY_LOGS,REVERT_BRAND_CHANGE,DELETE_BRAND_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from BrandActivityLogListComponent')
        this.getList();
    }
}