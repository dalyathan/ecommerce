import { Component, OnInit} from '@angular/core';
import { DataService } from '@etech/admin-ui/package/core';
import { ActivityLog } from '../../generated-admin-types';
@Component({
    selector: 'vdr-product-changes-compare',
    template:`
        <div>
            Hello Man and woman
        </div>
    `
  })
export class ProductChangesCompareComponent implements OnInit {
    logs: ActivityLog[];
    constructor(private dataService: DataService){
    }
    ngOnInit(): void {
    }
}