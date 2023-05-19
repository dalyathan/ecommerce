import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService, Dialog, GetCustomerGroups, GetCustomerList } from '@etech/admin-ui/package/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'vdr-select-customer-groups-dialog',
    templateUrl: './select-customer-groups-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCustomerGroupsDialogComponent implements Dialog<string[]>, OnInit {
    resolveWith: (result?: string[]) => void;
    groups$: Observable<GetCustomerGroups.Items[]>;
    selectedGroupIds: string[] = [];

    constructor(private dataService: DataService) {}

    ngOnInit() {
        this.groups$ = this.dataService.customer
            .getCustomerGroupList()
            .mapStream((res) => res.customerGroups.items);
    }

    cancel() {
        this.resolveWith();
    }

    add() {
        this.resolveWith(this.selectedGroupIds);
    }
}
