import {Component,ChangeDetectorRef,Output,Input,EventEmitter} from '@angular/core';
import { ModalService } from '@etech/admin-ui/package/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectMultiAdminDialogComponent } from '../select-multi-admin-dialog/select-multi-admin-dialog.component';
import { ActivityLogFilter, DateOperators } from '../../generated-admin-types';
import {take} from 'rxjs/operators';
@Component({
    selector: 'vdr-activity-log-filter',
    templateUrl: './activity-log-filter.component.html',
    styleUrls: ['./activity-log-filter.component.scss']
  })
export class ActivityLogFilterComponent{
    @Output() applyFilter: EventEmitter<ActivityLogFilter> = new EventEmitter();
    from:any=null;
    today:string= new Date().toISOString();
    doesContentReflectFilter:boolean= false;
    to:any=null;
    filter: ActivityLogFilter={adminIds:[]};
    constructor(
        private modalService:ModalService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
    ) {}
   async selectAdmins(){
        const selection= await this.modalService
            .fromComponent(SelectMultiAdminDialogComponent, {
                locals: {
                    // group: {name: "filter"},
                    route: this.route,
                    selectedCustomerIds: this.filter.adminIds as string[],
                },
                size: 'md',
                verticalAlign: 'top',
            }).pipe(take(1)).toPromise();
            if (selection) {
                this.filter.adminIds= selection;
            }
      }
      
      apply(){
        this.formatFilterValues();
        this.applyFilter.emit(this.filter);
      }

      formatFilterValues(){
        var queryFilter:DateOperators={};
        if(this.from == null && this.to != null){
            queryFilter={before: this.to};
        }
        else if(this.to == null && this.from != null){
            queryFilter ={after: this.from};

        }
        else if(this.from != null &&  this.to != null)
        {
            queryFilter= {between: {end: this.to, start: this.from}};
        }else{
        }
        this.filter.createdAt=queryFilter;
    }
}