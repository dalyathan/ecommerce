import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo, gql } from 'apollo-angular';
import jsPDF from 'jspdf';
import writeXlsxFile from 'write-excel-file';
import { RefundReportContent, RefundReportFilter, DateOperators } from '../../generated-admin-types';
import {take} from 'rxjs/operators';
import{GET_REFUNDS} from '../gql.document';

@Component({
    selector: 'vdr-refund-report',
    templateUrl: './refund-report.component.html',
    styleUrls: ['./refund-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundReportComponent
    implements OnInit {
    columns:string[]=['Order ID', 'Refunded', 'Customer', 'Purchase Date', 
        'Purchase Price', 'Payment Method','Refunded Amount','Refund Reason', 'Refunded By'];
    today:string= new Date().toISOString();
    salesList: RefundReportContent[]=[];
    salesListIsLoading: boolean= true;
    excelLoading: boolean= false;
    filter: RefundReportFilter={}
    from:any=null;
    to:any=null;
    doesContentReflectFilter:boolean= false;
    @ViewChild('formattedPdf', { static: false }) public formattedPdf: ElementRef;
    header:string=""
    currentPage: number =1;
    itemsPerPage: number=10;
    constructor(
        router: Router,
        route: ActivatedRoute,
        private apollo: Apollo,
        private cdr: ChangeDetectorRef,
        private elRef:ElementRef,
    ) {
        if(this.salesList.length ==  0){
            this.getCompletedOrders();
        }
    }

    setPage(event:number){
        this.currentPage= event;
    }

    setItemsPerPage(event:number){
        this.itemsPerPage= event;
    }

    ngOnInit() {
        if(this.salesList.length == 0){
            this.getCompletedOrders();
        }
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
        this.filter.purchased=queryFilter;
    }

    async exportToExcel(){
        this.excelLoading= true;
        var colNames:string[]=[
            'orderCode',
            'refunded',
            'customer',
            'purchaseDate',
            'price',
            'paymentMethod',
            'refundedAmount'
        ];
        var values:Object[][]=[];
        var cols:Object[]=[];
        for(var col of this.columns){
            cols.push({
                value: col
            });
        }
        values.push(cols);
        for (var _customer of this.salesList){
            var row:Object[]=[];
            for(var colName of colNames){
                row.push({
                    value: _customer[colName]
                });
            }
            values.push(row);
        }
        await writeXlsxFile(values, {
            fileName: `${new Date().toDateString()} refund report.xlsx`
        });
        this.excelLoading= false;
        this.cdr.detectChanges();
    }
    
    getCompletedOrders(){
        this.formatFilterValues();
        this.apollo.query<any>({
            query: gql(GET_REFUNDS),
            variables:{
                input: this.filter
            }
        })
        .pipe(take(1)).toPromise().then(({ data, loading }) => {
            // console.log(data.getRefundReport);
            this.salesList= data.getRefundReport.content;
            this.header= data.getRefundReport.header;
            this.doesContentReflectFilter=true;
            this.salesListIsLoading= loading;
            this.cdr.detectChanges();
        });
    }

    generatePDF() {
        const doc = new jsPDF({ unit: 'pt', orientation: "l", format: "tabloid" })
        // const pdfElement = this.elRef.nativeElement.getElementsByTagName('vdr-data-table')[0]; 
        this.excelLoading= true;
        this.setItemsPerPage(this.salesList.length);
        const docWidth = doc.internal.pageSize.getWidth();
        this.excelLoading=true;
        this.cdr.detectChanges();
        doc.html(this.formattedPdf.nativeElement, {
          callback: (pdf) => {
              pdf.save(`${new Date().toDateString()} refund report.pdf`)
              this.excelLoading= false;
              this.setItemsPerPage(10);
              this.cdr.detectChanges();
          }, 
          windowWidth: 1800,
          autoPaging: 'text',
          margin: [0, 0, 0, 0],
          width: docWidth,
        })
      }
}
