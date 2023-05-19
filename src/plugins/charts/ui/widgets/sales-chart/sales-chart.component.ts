import { Component, Input, OnInit, ChangeDetectorRef, NgModule,ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo,  } from 'apollo-angular';
import { ChartsSharedModule } from '../../charts-shared.module';
import { Chart, registerables } from 'chart.js';
import {Weekly} from '../../helpers/weekly';
import {Monthly} from '../../helpers/monthly';
import {Yearly} from '../../helpers/yearly';
import { GraphData } from '../../helpers/graph-data';
import { GotoOtherPagesService } from '../../goto-other-pages.service';


enum OrderStates{
    AddingItems='AddingItems',
    ArrangingPayment='ArrangingPayment',
    PaymentAuthorized= 'PaymentAuthorized',
    PaymentSettled='PaymentSettled',
    Shipped='Shipped',
    Delivered='Delivered',
}
enum OrderStatesVisible{
    AddingItems='Adding Items',
    ArrangingPayment='Arranging Payment',
    PaymentAuthorized= 'Payment Authorized',
    PaymentSettled='Payment Settled',
    Shipped='Shipped',
    Delivered='Delivered',
}
@Component({
    selector: 'vdr-sales-chart',
    templateUrl: './sales-chart.component.html',
    styleUrls: ['./sales-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesChartComponent
implements OnInit
{
    isLoading:boolean= false;
    myChart: Chart;
    graphData:GraphData;
    salesState:OrderStates;
    salesStateVisible:OrderStatesVisible;
    errorFetchingData= false;
    
    public _gqlFormat:string= `{
        orders(options: {filter: {%salesState createdAt: {after: "%fromDay"}}}){
            totalItems
            items{
                createdAt
                totalWithTax
            },
        }
      }`;
    public gqlFormat:string;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private orderPageRedirector:GotoOtherPagesService,
        public apollo: Apollo,
        private elementRef: ElementRef,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.gqlFormat= (' ' + this._gqlFormat).slice(1);
        this.salesState=OrderStates.AddingItems;
        this.salesStateVisible=OrderStatesVisible.AddingItems;
        this.cdr.detectChanges();
        this.weeklyData(null);
    }

    createGraph(){
        this.cdr.detectChanges();
        Chart.register(...registerables);
        if(this.myChart){
            this.myChart.destroy();
        }
        const handle= this.elementRef.nativeElement.querySelector('#salesChart');
        const myData= this.graphData;
       if(handle){
        this.myChart = new Chart(handle.getContext('2d'), {
                type: 'line',
                data: {
                    labels: myData.x_axis,
                    datasets: [{
                        label: 'Sales',
                        data: myData.y_axis,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    onClick: async (event, elements, chart)=>{
                        if (elements[0]) {    
                            const i = elements[0].index;
                            const rangeData= myData.xAxisDateRanges[i];
                            this.orderPageRedirector.goToOrderPage(event,elements,chart,rangeData,this.salesState);        
                         }
                    },
                }
            });
        }
        this.cdr.detectChanges();
    }

    async weeklyData(event:any){
        await this.load(new Weekly(this.apollo));
    }
    
    async monthlyData(event:any){
        await this.load(new Monthly(this.apollo));
    }
    
    async yearlyData(event:any){
        await this.load(new Yearly(this.apollo));
    }

    setSalesState(index:number){
        this.salesState= Object.values(OrderStates)[index];
        this.salesStateVisible= Object.values(OrderStatesVisible)[index];
        this.toggleDropdown(null);
        this.load(this.graphData);
        this.cdr.detectChanges()
    }
    
    async load(graphData:GraphData){
        this.gqlFormat= this.gqlFormat.replace("%salesState", `state: {eq: "${this.salesState}"},`);
        graphData.query= this.gqlFormat;
        this.isLoading= true;
        this.cdr.detectChanges();
        this.graphData= graphData;
        try{
            await graphData.getStocks(()=>this.createGraph());
            this.errorFetchingData= false;
        }catch(e){
            this.errorFetchingData= true;
        }
        this.isLoading= false;
        // this.cdr.detectChanges();
        // this.createGraph();
        // this.cdr.detectChanges();
        this.gqlFormat= (' ' + this._gqlFormat).slice(1);
    }

    toggleDropdown(event:any){
        var div= this.elementRef.nativeElement.querySelector('.btn-group-overflow');
        if(div.classList.contains('open')){
            div.classList.remove('open');
        }else{
            div.classList.add('open');
        }
    }
    
}

@NgModule({
    imports: [SharedModule, ChartsSharedModule],
    declarations: [SalesChartComponent],
})
export class SalesChartModule {}

