import { Component, Input, OnInit, ChangeDetectorRef, NgModule,ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo } from 'apollo-angular';
import { ChartsSharedModule } from '../../charts-shared.module';
import { Chart, registerables } from 'chart.js';
import {Weekly} from '../../helpers/weekly';
import {Monthly} from '../../helpers/monthly';
import {Yearly} from '../../helpers/yearly';
import { GraphData } from '../../helpers/graph-data';
import { GotoOtherPagesService } from '../../goto-other-pages.service';


@Component({
    selector: 'vdr-stock-chart',
    templateUrl: './stock-chart.component.html',
    styleUrls: ['./stock-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockChartComponent
implements OnInit
{
    isLoading:boolean= false;
    myChart: Chart;
    data:GraphData;
    errorFetchingData= false;
    public gqlFormat:string= `{
        products(options: {filter: {createdAt: {after: "%fromDay"}}}){
            totalItems
            items{
                createdAt
            },
        }
      }`;
    constructor(
        router: Router,
        route: ActivatedRoute,
        private orderPageRedirector:GotoOtherPagesService,
        public apollo: Apollo,
        private elementRef: ElementRef,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.weeklyData(null);
    }

    createGraph(){
        this.cdr.detectChanges();
        Chart.register(...registerables);
        if(this.myChart){
            this.myChart.destroy();
        }
        var handle= this.elementRef.nativeElement.querySelector('#stockChart');
        const myData= this.data;
       if(handle){
        this.myChart = new Chart(handle.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: myData.x_axis,
                    datasets: [{
                        label: 'Stocks Added',
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
                            const rangeData= myData.xAxisDateRanges[myData.xAxisDateRanges.length-1-i];
                            this.orderPageRedirector.goToProductsPage(event,elements,chart,
                                myData.xAxisDateRanges[i]);        
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

    async load(graphData:GraphData){
        this.isLoading= true;
        this.cdr.detectChanges();
        this.data= graphData;
        this.data.query= this.gqlFormat;
        this.cdr.detectChanges();
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
    }
    
}

@NgModule({
    imports: [SharedModule, ChartsSharedModule],
    declarations: [StockChartComponent],
})
export class StockChartModule {}

