import {  OnInit,Component,ChangeDetectionStrategy,ViewEncapsulation, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  DataService, FormInputComponent, LogicalOperator,  } from '@etech/admin-ui/package/core';
import { CustomFieldConfig } from '@etech/common/lib/generated-types';
import { Order } from '@etech/core';
import { Chart, registerables } from 'chart.js';
import { Apollo,  } from 'apollo-angular';
import { GraphData } from './helpers/graph-data';
import { Weekly } from './helpers/weekly';
import { Monthly } from './helpers/monthly';
import { Yearly } from './helpers/yearly';

@Component({
    selector: 'vdr-admin-fulfillment',
    templateUrl: './admin-fulfillment.component.html',
    styleUrls: ['./admin-fulfillment.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
  })
export class AdminFulfillmentFieldComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
    isListInput?: boolean | undefined;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    weeklyChart: Chart;
    monthlyChart: Chart;
    yearlyChart: Chart;

    weeklyGraphData: GraphData;
    monthlyGraphData: GraphData;
    yearlyGraphData: GraphData;

    totalOrder:number=0;
    totalAmount:number=0;
    public _gqlFormat:string;
    constructor(private dataService: DataService, private cdr: ChangeDetectorRef,
        private elementRef: ElementRef,public apollo: Apollo,){

    }
    ngOnInit(): void {
        let arrayForm:string[]= (this.formControl.value as string).split(',');
        if(arrayForm.length && arrayForm[0] !== ""){
            this._gqlFormat= `{
                orders(options: {filter: {id: {in: [${arrayForm.map((item)=>`"${item}"`)}]}}, filterOperator: OR,sort: {updatedAt: ASC}}){
                    totalItems
                    items{
                        createdAt
                        totalWithTax
                    },
                }
              }`;
              this.dataService.order.getOrders({filter: {id: {in: arrayForm}}, filterOperator: LogicalOperator.OR}).single$.toPromise().then((result)=>{
               let data= result.orders.items as Order[];
                // console.log(data);
                this.weekly(data);
                this.monthly(data);
                this.yearly(data);
                this.setTotal(this.weeklyGraphData);
              });
        }
    }

    async weekly(orders: Order[]){
        this.weeklyGraphData=new Weekly(orders);
        this.render("weeklyGraph", this.weeklyChart,this.weeklyGraphData);
    }
    
    setTotal(graph: GraphData){
        this.totalAmount= graph.totalAmount;
        this.totalOrder= graph.totalOrders;
        this.cdr.detectChanges();
    }

    async monthly(orders: Order[]){
        this.monthlyGraphData=new Monthly(orders);
        this.render("monthlyGraph", this.monthlyChart,this.monthlyGraphData);
    }
    
    async yearly(orders: Order[]){
        this.yearlyGraphData=new Yearly(orders);
        this.render("yearlyGraph", this.yearlyChart,this.yearlyGraphData);
    }

    render(id:string,chartHandle:Chart, graph: GraphData){
        Chart.register(...registerables);
        if(chartHandle){
            chartHandle.destroy();
        }
        graph.generateXAxis();
        graph.generateYAxis();
        // console.log(graph)
        var elementHandle= this.elementRef.nativeElement.querySelector(`#${id}`);
        if(elementHandle){
            chartHandle = new Chart(elementHandle.getContext('2d'), {
                type: 'line',
                data: {
                    labels: graph.x_axis,
                    datasets: [{
                        label: 'Sales in ETB',
                        data: graph.y_axis,
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
                }
            });
        }
    }

}