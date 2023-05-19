import {  Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { CustomFieldConfig, FormInputComponent, DataService} from '@etech/admin-ui/package/core';
import{take} from 'rxjs/operators';
import { ARE_ORDER_LINE_ORDER_BASED } from '../gql.types';
@Component({
    template:  `
    <div *ngIf="allowInteraction">
      <input type="checkbox" clrToggle (change)="toggle($event)" [attr.disabled]="(orderHasPayments||!areAnyItemsOrderBased)?'disabled':null" [(ngModel)]="checkboxModel"/>
      <p *ngIf="!areAnyItemsOrderBased"> 
        Since this order contains no order based items, the customer can go  <br/> a head and make the payment.
      </p>
      <p *ngIf="areAnyItemsOrderBased"> 
        This order contains order based item(s).
        <span *ngIf="!orderHasPayments">When the items are in stock, <br/> make sure to notify
        the customer by toggling this button on.</span>
      </p>
    </div>
    <div *ngIf="!allowInteraction && areAnyItemsOrderBased">
      Payment has already been settled for this order.
    </div>
    <div *ngIf="!allowInteraction && !areAnyItemsOrderBased">
      This order contains no order based items.
    </div>
    `,
  })
  export class AllowCustomerPaymentOrderCustomFieldComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
    isListInput?: boolean | undefined;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    areAnyItemsOrderBased:boolean= false;
    checkboxModel:boolean= false;
    orderHasPayments: boolean= false;
    allowInteraction: boolean= false;
    async ngOnInit(): Promise<void> {
      const routeData= await this.route.params.pipe(take(1)).toPromise();
      this.dataService.shippingMethod.getShippingMethod(routeData.id).valueChanges
    .subscribe(async({ data, loading })=>{
      if(!loading){
        const order=data.order;
        this.allowInteraction= order.state === 'AddingItems' || order.state ==='Created' 
        || order.state ==='ArrangingPayment';
        this.orderHasPayments= order.payments?.length??false;
        const lineItemsState:any= await this.dataService.query(ARE_ORDER_LINE_ORDER_BASED, 
          {id: routeData.id }).single$.pipe(take(1)).toPromise();
        this.areAnyItemsOrderBased= lineItemsState.order.lines.map((line)=> line.productVariant.product.customFields.is_order_based)
        .reduce((soFar, current)=> soFar||current);
        this.checkboxModel= this.formControl.value as boolean;
        this.cdr.detectChanges();
      }
    });
    }

    constructor(private route: ActivatedRoute, private dataService: DataService,
      private cdr: ChangeDetectorRef){
      
    }

    toggle(event:any){
      this.formControl.setValue(event.target.checked)
      this.formControl.markAsDirty();
    }
  }