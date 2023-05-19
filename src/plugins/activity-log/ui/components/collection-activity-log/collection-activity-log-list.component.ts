import { Component, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { COLLECTION_ACTIVITY_LOGS, REVERT_COLLECTION_CHANGE, DELETE_COLLECTION_ACTIVITY_LOG } from '../../activity-log-resolver.graphql';
import { NotificationService } from '@etech/admin-ui/package/core';
import { ActivityLogActions } from '../actions';
@Component({
    selector: 'vdr-collection-activity-log-list',
    template:`
     <vdr-activity-log-list [logs]="logs"
     (revertChanges)="revertChanges($event[0])"
     (deleteActivityLog)="deleteActivityLog($event[0])"
     (applyFilter)="getList($event)"
     ></vdr-activity-log-list>
    `
  })
export class CollectionActivityLogListComponent extends ActivityLogActions implements OnInit {

    constructor( dataService: Apollo,  cdr: ChangeDetectorRef,  ns: NotificationService){
      super(cdr,ns,dataService,COLLECTION_ACTIVITY_LOGS,REVERT_COLLECTION_CHANGE,DELETE_COLLECTION_ACTIVITY_LOG);
  } 
    ngOnInit(): void {
      // console.log('from CollectionActivityLogListComponent')
      this.getList();
    }
}