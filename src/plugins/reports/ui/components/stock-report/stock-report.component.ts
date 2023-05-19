import { Component, ElementRef, OnInit, ChangeDetectorRef,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Apollo, gql } from 'apollo-angular';
import jsPDF from 'jspdf';
import writeXlsxFile from 'write-excel-file';
import { StockReportContent, StockReportFilter, DateOperators } from '../../generated-admin-types';
import {take} from 'rxjs/operators';
import {GET_PRODUCTS} from '../gql.document';

@Component({
    selector: 'vdr-stock-report',
    templateUrl: './stock-report.component.html',
    styleUrls: ['./stock-report.component.scss'],
})
export class StockReportComponent
{
    today:string= new Date().toISOString();
    productsList: StockReportContent[];
    totalItems: number;
    from:any=null;
    to:any=null;
    searchedProductsList: StockReportContent[];
    listLoading: boolean= true
    excelLoading: boolean= false
    currentPage: number =1;
    itemsPerPage: number=10;
    filter: StockReportFilter={};
    doesContentReflectFilter:boolean= false;
    header:string=""
    priceIncludesTax:boolean;
    @ViewChild('formattedPdf', { static: false }) public formattedPdf: ElementRef;
    columns:string[]=[];
    

    constructor(
        router: Router,
        route: ActivatedRoute,
        private apollo: Apollo,
        private cdr: ChangeDetectorRef,
        private elRef:ElementRef,
    ) {
        this.getProductVariants();
    }

    setPage(event:number){
        this.currentPage= event;
    }

    setItemsPerPage(event:number){
        this.itemsPerPage= event;
    }

    setSearchTerm(term: string) {
        const oldSearchLength= this.searchedProductsList.length;
        const searchIndicationString=', starting with the word';
        const searchIndicationIndex= this.header.indexOf(searchIndicationString);
        if(searchIndicationIndex!=-1){
            this.header=this.header.substring(0,searchIndicationIndex);
        }
        if(term && term.trim() !== ""){
            this.searchedProductsList= this.productsList.filter(
                (item)=> 
                item.name?item.name.toLowerCase().startsWith(term.toLowerCase(),0):false
            );
            this.header=this.header.replace(`${oldSearchLength}`,`${this.searchedProductsList.length}`);
            this.header+=`${searchIndicationString} ${term}`;
        }
        else{
            this.searchedProductsList= this.productsList;
            this.header=this.header.replace(`${oldSearchLength}`,`${this.searchedProductsList.length}`);
        }
        this.cdr.detectChanges();
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
    
    getProductVariants(){
        this.formatFilterValues();
        this.apollo.query<any>({
            query: gql(GET_PRODUCTS),
            variables: {
                input: this.filter
            }
        })
        .pipe(take(1)).toPromise().then(({ data, loading }) => {
            this.listLoading= loading;
            this.productsList = data.getStockReport.content;
            this.searchedProductsList= this.productsList;
            this.priceIncludesTax= data.getStockReport.priceIncludesTax;
            if(this.priceIncludesTax){
                this.columns= ['SKU', 'Product Name', 'Created','Opening Stock','Stock on Hand','Closing Stock', 
                    `Default Price (With Tax)`, 'Customer Group','Segment Price'];
            }else{
                this.columns= ['SKU', 'Product Name', 'Created','Opening Stock','Stock on Hand', 'Closing Stock',
                    `Default Price (Without Tax)`, 'Customer Group','Segment Price']
            }
            this.totalItems= this.productsList.length;
            this.header= data.getStockReport.header;
            this.doesContentReflectFilter= true;
            this.cdr.detectChanges();
        });
    }

    withAction(){
        return [...this.columns, 'Action'];
    }

    generatePDF() {
        const doc = new jsPDF({ unit: 'pt', orientation: "l", format: "tabloid" })
        this.excelLoading= true;
        this.setItemsPerPage(this.searchedProductsList.length);
        const docWidth = doc.internal.pageSize.getWidth();
        this.excelLoading=true;
        this.cdr.detectChanges();
        doc.html(this.formattedPdf.nativeElement, {
          callback: (pdf) => {
              pdf.save(`${new Date().toDateString()} stock report.pdf`)
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

    async export(){
        this.excelLoading= true;
        var colNames:string[]=[
            'sku',
            'name',
            'createdAt',
            'openingStock',
            'stockOnHand',
            'defaultPrice',
            'customerGroup',
            'segmentPrice',
            'closingStock'
        ];
        var values:Object[][]=[];
        var cols:Object[]=[];
        for(var col of this.columns){
            cols.push({
                value: col
            });
        }
        values.push(cols);
        for (var _customer of this.searchedProductsList){
            var row:Object[]=[];
            for(var colName of colNames){
                row.push({
                    value: _customer[colName]
                });
            }
            values.push(row);
        }
        await writeXlsxFile(values, {
            fileName: `${new Date().toDateString()} stock report.xlsx`
        });
        
        this.excelLoading= false;
        this.cdr.detectChanges();
    }
}
