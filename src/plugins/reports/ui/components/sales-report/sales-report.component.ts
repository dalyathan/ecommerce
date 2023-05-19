import { ChangeDetectionStrategy, Component, ChangeDetectorRef, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo, gql } from 'apollo-angular';
import writeXlsxFile from 'write-excel-file';
import { SalesReportContent, SalesReportFilter, DateOperators } from '../../generated-admin-types';
import jsPDF from 'jspdf';
import { ModalService, ProductMultiSelectorDialogComponent } from '@etech/admin-ui/package/core';
import {AddCustomerToGroupDialogComponent} from '@etech/admin-ui/package/customer';
import { SelectCustomerGroupsDialogComponent } from '../../select-customers-group-dialog/select-customer-groups-dialog.component';
import {take} from 'rxjs/operators';
import {ORDERS} from '../gql.document';
@Component({
    selector: 'vdr-sales-report',
    templateUrl: './sales-report.component.html',
    styleUrls: ['./sales-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReportComponent
    {
    today:string= new Date().toISOString();
    salesList: SalesReportContent[]=[];
    from:any=null;
    to:any=null;
    salesListIsLoading: boolean= true;
    excelLoading: boolean= false;
    currentPage: number =1;
    itemsPerPage: number=5;
    filter: SalesReportFilter={productIds:[], customerIds:[], customerCategoryIds:[]};
    taxRates: string[]=[];
    isListEmpty: boolean=false;
    doesContentReflectFilter:boolean= false;
    header:string="";
    columns:string[]=[];
    priceIncludesTax:boolean;
    @ViewChild('formattedPdf', { static: false }) public formattedPdf: ElementRef;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService:ModalService, 
        private apollo: Apollo,
        private cdr: ChangeDetectorRef,
        private elRef:ElementRef,
    ) {
        if(this.salesList.length ===  0){
            this.getCompletedOrders(true);
        }
    }

    setPage(event:number){
        this.currentPage= event;
    }

    setItemsPerPage(event:number){
        this.itemsPerPage= event;
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
        if(this.filter.taxRate === "null"){
            this.filter.taxRate= undefined;
        }
        this.filter.orderPlacedAt=queryFilter;
    }

    async exportToExcel(){
        this.excelLoading= true;
        var colNames:string[]=[
            'orderCode',
            'orderPlacedAt',
            'customer',
            'sku',
            'unitPrice',
            'totalPrice',
            'discount',
            'taxRate',
            'taxCollected',
            'totalAmount',
            'paymentMethod',
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
            fileName: `${new Date().toDateString()} sales report.xlsx`
        });
        this.excelLoading= false;
        this.cdr.detectChanges();
    }

    generatePDF() {
        const doc = new jsPDF({ unit: 'pt', orientation: "l", format: "tabloid" })
        // const pdfElement = this.elRef.nativeElement.getElementsByTagName('vdr-data-table')[0]; 
        this.excelLoading= true;
        this.setItemsPerPage(this.salesList.length);
        const docWidth = doc.internal.pageSize.getWidth();
        this.cdr.detectChanges();
        doc.html(this.formattedPdf.nativeElement, {
          callback: (pdf) => {
              pdf.save(`${new Date().toDateString()} sales report.pdf`)
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
    
    getCompletedOrders(cacheRates:boolean){
        this.salesListIsLoading= true;
        this.formatFilterValues();
        this.apollo.query<any>({
            query: gql(ORDERS),
            variables:{
                input: this.filter
            }
        })
        .pipe(take(1)).toPromise().then(({ data, loading }) => {
            this.salesList= data.getSalesReport.content as SalesReportContent[];
            this.priceIncludesTax= data.getSalesReport.priceIncludesTax;
            if(cacheRates){
                for(let item of data.getSalesReport.content ){
                    if(item.taxRate && this.taxRates.indexOf(item.taxRate)==-1){
                        this.taxRates.push(item.taxRate);
                    }
                }
            }
            if(this.priceIncludesTax){
                this.columns=['Order ID', 'Date','Customer', 'SKU','Unit Price(With Tax)', 'Total Price(With Tax)',
                    'Discount','Tax Rate','Tax Collected','Total Amount', 'Payment Method'];
            }else{
                this.columns=['Order ID', 'Date','Customer', 'SKU','Unit Price(Without Tax)', 'Total Price(Without Tax)',
                    'Discount','Tax Rate','Tax Collected','Total Amount', 'Payment Method'];
            }
            this.header= data.getSalesReport.header;
            this.salesListIsLoading= loading;
            this.doesContentReflectFilter= true;
            this.cdr.detectChanges();
            setTimeout(()=>{
                this.doesContentReflectFilter= true;
                this.cdr.detectChanges();
            },5);
        });
    }

    async selectProducts() {
        const selection= await this.modalService
            .fromComponent(ProductMultiSelectorDialogComponent, {
                size: 'xl',
                locals: {
                    mode: 'product',
                    initialSelectionIds: this.filter.productIds?.map((item)=> item.toString()),
                    allowCreateProduct: false,
                },
            })
            .pipe(take(1)).toPromise();
            if (selection) {
                this.filter.productIds=[];
                if(this.filter.productIds){
                    selection.map((item) =>{
                        this.filter.productIds?.push(item.productId);
                    }
                    );
                    this.cdr.detectChanges();
                }
            }
      }

      async selectCustomers(){
       const selection= await this.modalService
            .fromComponent(AddCustomerToGroupDialogComponent, {
                locals: {
                    group: {name: "filter"},
                    route: this.route,
                    selectedCustomerIds: this.filter.customerIds?.map((item)=> item.toString()),
                },
                size: 'md',
                verticalAlign: 'top',
            }).pipe(take(1)).toPromise();
            if (selection) {
                this.filter.customerIds=[];
                if(this.filter.customerIds){
                    selection.map(item =>{
                        this.filter.customerIds?.push(item)
                    }
                    );
                    this.cdr.detectChanges();
                }
            }
      }

      async selectCustomerGroups(){
        const selection= await this.modalService
            .fromComponent(SelectCustomerGroupsDialogComponent, {
                locals: {
                    selectedGroupIds: this.filter.customerCategoryIds?.map((item)=> item.toString()),
                },
                size: 'md',
            }).pipe(take(1)).toPromise();
            if (selection) {
                this.filter.customerCategoryIds=[];
                if(this.filter.customerCategoryIds){
                    selection.map(item =>
                        this.filter.customerCategoryIds?.push(item)
                    );
                    this.cdr.detectChanges();
                }
            }
      }

}
