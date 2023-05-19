import { Component,Output,Input,EventEmitter} from '@angular/core';
import { ID } from '@etech/core';
import { ActivityLog, ActivityLogFilter } from '../../generated-admin-types';
@Component({
    selector: 'vdr-activity-log-list',
    templateUrl: './activity-log-list.component.html',
    styleUrls: ['./activity-log-list.component.scss']
  })
export class ActivityLogListComponent {
    @Output() deleteActivityLog: EventEmitter<any> = new EventEmitter();
    @Output() revertChanges: EventEmitter<any> = new EventEmitter();
    @Output() applyFilter: EventEmitter<ActivityLogFilter> = new EventEmitter();
    @Input() logs: ActivityLog[]=[];
    currentPage: number =1;
    itemsPerPage: number=10;

    setPage(event:number){
        this.currentPage= event;
    }
  
    setItemsPerPage(event:number){
        this.itemsPerPage= event;
    }

    deleteLog(logId: ID){
        this.deleteActivityLog.emit([logId]);
    }

    revert(logId: ID){
        this.revertChanges.emit([logId]);
    }

    middleWay(filter: ActivityLogFilter){
        this.applyFilter.emit(filter);
    }
}