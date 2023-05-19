import {  Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';
import { stockOnHandQuery } from './gql.helpers';
import {Apollo} from 'apollo-angular';
export class TimelineEntryData{
    stockOnHand: number;
    stockChange: number;
    adminName: String;
    createdAt: String;
    isStockAdded:boolean;
}
@Component({
    template:  `
    <div style="margin-top: 12px;
    margin-bottom: 12px;
    margin-left: 12px;
    margin-right: 12px;">
        <vdr-timeline-entry [iconShape]="isFirst?'store':''" [createdAt]="log.createdAt" [featured]="isFirst" [name]="log.adminName"
        *ngFor="let log of data; index as i; first as isFirst"
        (expandClick)="expanded = !expanded" [collapsed]="!expanded && !isFirst">
                <div class="title">
                    {{log.isStockAdded?'Added':'Removed'}} {{log.stockChange}} stocks
                </div>
                <div class="flex">
                    {{log.stockOnHand}} Stocks in total
                </div>
        </vdr-timeline-entry>
        <vdr-timeline-entry [isLast]="true" [createdAt]="variantCreatedAt" [featured]="true">
            <div class="title">
               Product Variant Created
            </div>
        </vdr-timeline-entry>
    </div>
    `,
  })
  export class ProductVariantStockTimeline implements FormInputComponent<CustomFieldConfig>, OnInit {
    isListInput?: boolean | undefined=true;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    variantCreatedAt:Date;
    expanded = false;
    data:TimelineEntryData[]=[];
    name:String='Abebe';
    constructor(private dataService: Apollo, private cdr: ChangeDetectorRef){
        // this.now= new Date();
    }
    ngOnInit(): void {
        this.dataService.watchQuery({query: stockOnHandQuery,variables:
            {id:this.formControl.parent?.parent?.value.id}, pollInterval:1000})
        .valueChanges
        .subscribe(({ data, loading })=>{
            if(!loading){
                this.variantCreatedAt= new Date((data as any).productVariant.createdAt);
                const reversed= 
                ((data as any).productVariant.customFields.stockTimeline as any[]);
                this.data=[];
                for(let index=reversed.length-1;index>=0;index--){
                    const entry= reversed[index];
                    this.data.push({
                        adminName: entry.administrator.firstName+' '+entry.administrator.lastName,
                        stockChange: Math.abs(entry.stockChange),
                        stockOnHand: entry.stockOnHand,
                        createdAt: entry.createdAt,
                        isStockAdded: entry.stockChange>0,
                    })
                }
                this.cdr.detectChanges();
            }
        });
    }
    
  }
  /**
   * <ul class="clr-timeline clr-timeline-vertical">
        <li class="clr-timeline-step disabled">
            <div class="clr-timeline-step-header"> Thu Mar 25</div>
            <cds-icon role="img" shape="error-standard" aria-label="Error"></cds-icon>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">Product deleted</span>
            </div>
        </li>
        <li class="clr-timeline-step">
            <div class="clr-timeline-step-header">
                Sun Mar 21
            </div>
            <a href="..." role="tooltip" aria-haspopup="true" class="tooltip tooltip-sm tooltip-left">
                <cds-icon role="img" shape="dot-circle" aria-label="Current"></cds-icon>
                <span class="tooltip-content">
                    Opening Stock
                    17
                </span>
            </a>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">
                    10 new stocks added
                </span>
            </div>
        </li>
        <li class="clr-timeline-step">
            <div class="clr-timeline-step-header">
                Tue Mar 23
            </div>
            <cds-icon role="img" shape="dot-circle" aria-label="Current"></cds-icon>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">
                10 new stocks added
                </span>
            </div>
        </li>
        <li class="clr-timeline-step">
            <div class="clr-timeline-step-header">
                Tue Mar 23
            </div>
            <cds-icon role="img" shape="dot-circle" aria-label="Current"></cds-icon>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">
                10 new stocks added
                </span>
            </div>
        </li>
        <li class="clr-timeline-step">
            <div class="clr-timeline-step-header">
                Tue Mar 23
            </div>
            <cds-icon role="img" shape="dot-circle" aria-label="Current"></cds-icon>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">
                10 new stocks added
                </span>
            </div>
        </li>
        <li class="clr-timeline-step disabled">
            <div class="clr-timeline-step-header">
                    August 16, 2018 8:02 PM
            </div>
            <cds-icon role="img" shape="success-standard" aria-label="Completed"></cds-icon>
            <div class="clr-timeline-step-body">
                <span class="clr-timeline-step-description">Variant created with 100 stocks</span>
            </div>
        </li>
    </ul>

    <vdr-timeline-entry iconShape="" [createdAt]="variantCreatedAt" 
        [featured]="false" [name]="name" [collapsed]="!expanded && true">
            <div class="title">
                Added 10 stocks
            </div>
            <div class="flex">
                100 Stocks in total
            </div>
        </vdr-timeline-entry>
        <vdr-timeline-entry iconShape="" [createdAt]="variantCreatedAt" [featured]="false" [name]="name" [collapsed]="!expanded && true">
            <div class="title">
                Removed 10 stocks
            </div>
            <div class="flex">
                100 Stocks in total
            </div>
        </vdr-timeline-entry>
        <vdr-timeline-entry iconShape="" [createdAt]="variantCreatedAt" [featured]="false" [name]="name" [collapsed]="!expanded && true">
            <div class="title">
                Added 10 stocks
            </div>
            <div class="flex">
                100 Stocks in total
            </div>
        </vdr-timeline-entry>
   */