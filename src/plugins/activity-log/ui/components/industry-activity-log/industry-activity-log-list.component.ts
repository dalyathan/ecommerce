import { Component, OnInit, Input,ChangeDetectorRef} from '@angular/core';
import { NotificationService } from '@etech/admin-ui/package/core';
import { Apollo } from 'apollo-angular';
import {INDUSTRY_ACTIVITY_LOGS, REVERT_INDUSTRY_CHANGE, DELETE_INDUSTRY_ACTIVITY_LOG} from '../../activity-log-resolver.graphql';
import { ActivityLogActions } from '../actions';
@Component({
    selector: 'vdr-industry-activity-log-list',
    template:`
        <vdr-activity-log-list [logs]="logs"
        (revertChanges)="revertChanges($event[0])"
        (deleteActivityLog)="deleteActivityLog($event[0])"
        (applyFilter)="getList($event)"
        ></vdr-activity-log-list>
    `
  })
export class IndustryActivityLogListComponent extends ActivityLogActions implements OnInit {
    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
        super(cdr,ns,dataService,INDUSTRY_ACTIVITY_LOGS,REVERT_INDUSTRY_CHANGE,DELETE_INDUSTRY_ACTIVITY_LOG);
    }
    ngOnInit(): void {
        // console.log('from IndustryActivityLogListComponent')
        this.getList();
    }
}