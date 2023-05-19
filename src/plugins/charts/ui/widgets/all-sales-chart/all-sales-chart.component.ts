import { Component, Input, OnInit, ChangeDetectorRef, NgModule,ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { SharedModule } from '@etech/admin-ui/package/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo,} from 'apollo-angular';
import { ChartsSharedModule } from '../../charts-shared.module';
import { Chart, registerables, } from 'chart.js';
import { PieData } from '../../helpers/pie-data';
import { GotoOtherPagesService } from '../../goto-other-pages.service';

@Component({
    selector: 'vdr-all-sales-chart',
    templateUrl: './all-sales-chart.component.html',
    styleUrls: ['./all-sales-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllSalesChartComponent
implements OnInit
{
    isLoading:boolean= false;
    myChart: Chart;
    data:PieData;
    errorFetchingData= false;
    
    public gqlFormat:string= `{
        orders(options: {filter: {createdAt: {after: "%fromDay"},}}){
            totalItems
            items{
                createdAt
                state
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
        this.data= new PieData(this.apollo);
        this.cdr.detectChanges();
        this.weeklyData(null);
    }

    createGraph(){
        this.cdr.detectChanges();
        Chart.register(...registerables);
        if(this.myChart){
            this.myChart.destroy();
        } 
        var handler= this.elementRef.nativeElement.querySelector('#allSalesChart');
        const myData= this.data;
       if(handler){
        this.myChart = new Chart(handler.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: myData.labels,
                    datasets: [{
                        label: 'Sales',
                        data: myData.data,
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
                    onClick: async (event, elements, chart)=>{
                        if (elements[0]) {    
                            const i = elements[0].index;
                            this.orderPageRedirector.goToOrderPage(event,elements,chart,{
                                end: new Date().toISOString(),
                                start: myData.fromDayISOFormat
                            },chart.data.labels?(chart.data.labels![i] as string):undefined);        
                         }
                    },
                }
            });
        }
        this.cdr.detectChanges();
    }

    async weeklyData(event:any){
        this.isLoading= true;
        this.cdr.detectChanges();
        this.data.formatGqltoThisWeek();
        await this.drawGraph();
    }
    
    async monthlyData(event:any){
        this.isLoading= true;
        this.cdr.detectChanges();
       this.data.formatGqltoThisMonth();
       await this.drawGraph();
    }
    
    async yearlyData(event:any){
        this.isLoading= true;
        this.cdr.detectChanges();
       this.data.formatGqltoThisYear();
       await this.drawGraph();
    }
    
    async drawGraph(){
        try{
            await this.data.getStocks(()=>this.createGraph());
            this.errorFetchingData= false;
            this.isLoading= false;
         }catch(e){
             this.errorFetchingData= true;
         }
        // this.cdr.detectChanges();
        // this.createGraph();
        // this.cdr.detectChanges();

    }
    
}

@NgModule({
    imports: [SharedModule, ChartsSharedModule],
    declarations: [AllSalesChartComponent],
})
export class AllSalesChartModule {}

