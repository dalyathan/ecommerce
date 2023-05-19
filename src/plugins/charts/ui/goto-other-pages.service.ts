import {HttpHeaders,} from '@angular/common/http';
import{take} from 'rxjs/operators';
import {  Injectable } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import { ActiveElement, Chart, ChartEvent } from 'chart.js';
import { DateRange } from '@etech/admin-ui/package/core';
@Injectable({
    providedIn: 'any',
  })
export class GotoOtherPagesService{
    constructor(private router: Router,
        private route: ActivatedRoute,){

    }

    async goToOrderPage(event:ChartEvent, elements: ActiveElement[], chart:Chart, 
        ordersRange:DateRange,states?:string){
        if (elements[0]) {            
            const i = elements[0].index;
            await this.router.navigate(['./orders',], {
                relativeTo: this.route,
                queryParams:{ 
                    'placedAtStart': ordersRange.start,
                    'placedAtEnd': ordersRange.end,
                    'filter':'custom',
                    'states':states,
                    'page':1
                }
            });
         }
    }

    async goToProductsPage(event:ChartEvent, elements: ActiveElement[], chart:Chart, 
        ordersRange:DateRange){
        if (elements[0]) {            
            const i = elements[0].index;
            await this.router.navigate(['./catalog/products',], {
                relativeTo: this.route,
                queryParams:{ 
                    'createdAtStart': ordersRange.start,
                    'createdAtEnd': ordersRange.end,
                    'page':1
                }
            });
         }
    }
}