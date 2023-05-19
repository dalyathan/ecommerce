import { Component,OnInit,ChangeDetectorRef} from '@angular/core';
import { DataService, ModalService, NotificationService, ProductMultiSelectorDialogComponent, ProductSelectorSearch } from '@etech/admin-ui/package/core';
import {Subject} from 'rxjs';
import {gql} from "apollo-angular";
import { PriceListDisplay } from '../../generated-admin-types';
import { ID } from '@etech/core';
import {take} from 'rxjs/operators';
@Component({
    selector: 'view-price-lists',
    templateUrl: './view-price-lists.component.html',
    styleUrls: ['./view-price-lists.component.scss']
  })
  export class ViewPriceListsComponent implements OnInit {
    showMessage:boolean;
    taxCategories: any[];
    customerGroups: any[];
    selectedCustomerGroup: any;
    routeId: string;
    title: string='';
    percentDiscount: string | null;
    selectedProductVariantIds:ID[]=[];
    searchInput$ = new Subject<string>();
    priceLists:PriceListDisplay[];
    priceListIsLoading: boolean;
    currentPage: number;
    itemsPerPage: number;
    isDiscountStoreWide:boolean=false;
    currentlyBeingEditedPriceList: PriceListDisplay | null;
    constructor(private dataService: DataService, 
      private modalService:ModalService, 
        private changeDetectorRef: ChangeDetectorRef, 
        private notificationService: NotificationService){

    }
    ngOnInit(): void {
      this.currentPage=1;
      this.itemsPerPage= 10;
      this.currentlyBeingEditedPriceList= null;
      this.showMessage= false;
      this.priceListIsLoading= true;
      // this.selectedProductVariant=null;
      this.getTaxCategories();
      this.getPriceList();
    }
    getTaxCategories(){
      const query=gql`query GetCustomerGroups{
        customerGroups{
          items{
            id
            name
          }
        }
      }`;

      this.dataService.query(query).mapSingle(data=> (data as any).customerGroups).toPromise().then((result)=>{
        this.customerGroups= result.items;
      });
    }

    getPriceList(){
      const query=gql`
      query GetPriceLists{
        priceLists{
          id
          productVariantIds
          title
          enabled
          percentDiscount
          isPriceListStoreWide
          customergroup{
            name
            id
          }
        }
      }`;
      this.dataService.query(query).mapSingle(data=> (data as any).priceLists).toPromise().then((result)=>{
        this.priceLists= result;
        this.priceListIsLoading= false;
      });
    }

    create(){
      if(this.selectedProductVariantIds.length === 0 ||
        this.selectedCustomerGroup === null || this.selectedCustomerGroup === undefined ||
        this.percentDiscount === null || this.percentDiscount === undefined || this.percentDiscount === ''){
          this.notificationService.error("Please fill all the required fields");
          return;
        }else{
          let valueInserted= parseFloat(this.percentDiscount);
          if(isNaN(valueInserted) || valueInserted<=0 || valueInserted>100){
            this.notificationService.error("Percent value must be a number between 0 and 100");
            return;
          }
        }
      this.showMessage= false;
      let mutation=`
        mutation CreateEditPriceList{
          ${ this.currentlyBeingEditedPriceList != null ?
            `editPriceList(input: {
              priceListId: "${this.currentlyBeingEditedPriceList.id}"
              title: "${this.title}",
              productVariantIds: [${this.selectedProductVariantIds.map((item)=> `"${item}"`)}],
              customerGroupId: "${this.selectedCustomerGroup.id}",
              percentDiscount: "${this.percentDiscount}"
            })`:
            `createPriceList(input: {
              title: "${this.title}",
              productVariantIds: [${this.selectedProductVariantIds.map((item)=> `"${item}"`)}],
              customerGroupId: "${this.selectedCustomerGroup.id}",
              percentDiscount: "${this.percentDiscount}"
            })`
        }
          {
            id
            productVariantIds
            title
            enabled
            percentDiscount
            customergroup{
              name
              id
            }
          }
        }
      `;
      this.dataService.mutate(gql(mutation)).toPromise().then((result:any)=>{
        if(this.currentlyBeingEditedPriceList != null){
          if(result.editPriceList.message !== undefined && result.editPriceList.message !== null){
            this.notificationService.error(result.editPriceList.message);
          }else{
              this.notificationService.success("Price List Successfully edited");
              for(let priceListIndex in this.priceLists){
                if(this.priceLists[priceListIndex].id === result.editPriceList.id){
                  this.priceLists=[
                    ...(this.priceLists.slice(0, parseInt(priceListIndex))), 
                    result.editPriceList,
                    ...(this.priceLists.slice(parseInt(priceListIndex)+1)) ]
                    return;
                }
              }  
          }
        }else{
          if(result.createPriceList.message !== undefined && result.createPriceList.message !== null){
            this.notificationService.error(result.createPriceList.message);
          }else{
              this.notificationService.success("Price List Successfully created");
              this.priceLists=[...this.priceLists, result.createPriceList ]
          }
        }
        this.currentlyBeingEditedPriceList= null;
      });
    }

    createStorewideDiscount(){
      if(
        this.percentDiscount === null || this.percentDiscount === undefined || this.percentDiscount === ''){
          this.notificationService.error("Please fill all the required fields");
          return;
        }else{
          let valueInserted= parseFloat(this.percentDiscount);
          if(isNaN(valueInserted) || valueInserted<=0 || valueInserted>100){
            this.notificationService.error("Percent value must be a number between 0 and 100");
            return;
          }
        }
      this.showMessage= false;
      let mutation=`
        mutation CreateEditPriceList{
          ${ this.currentlyBeingEditedPriceList != null ?
            `editStoreWideDiscount(input: {
              priceListId: "${this.currentlyBeingEditedPriceList.id}",
              productVariantIds: [${this.selectedProductVariantIds.map((item)=> `"${item}"`)}],
              title: "${this.title}",
              percentDiscount: "${this.percentDiscount}"
            })`:
            `createStoreWideDiscount(input: {
              title: "${this.title}",
              productVariantIds: [${this.selectedProductVariantIds.map((item)=> `"${item}"`)}],
              percentDiscount: "${this.percentDiscount}"
            })`
        }
          {
            id
            productVariantIds
            title
            enabled
            percentDiscount
            customergroup{
              name
              id
            }
          }
        }
      `;
      this.dataService.mutate(gql(mutation)).toPromise().then((result:any)=>{
        if(this.currentlyBeingEditedPriceList != null){
          if(result.editStoreWideDiscount.message !== undefined && result.editStoreWideDiscount.message !== null){
            this.notificationService.error(result.editStoreWideDiscount.message);
          }else{
              this.notificationService.success("Price List Successfully edited");
              for(let priceListIndex in this.priceLists){
                if(this.priceLists[priceListIndex].id === result.editStoreWideDiscount.id){
                  this.priceLists=[
                    ...(this.priceLists.slice(0, parseInt(priceListIndex))), 
                    result.editStoreWideDiscount,
                    ...(this.priceLists.slice(parseInt(priceListIndex)+1)) ]
                    return;
                }
              }  
          }
        }else{
          if(result.createStoreWideDiscount.message !== undefined && result.createStoreWideDiscount.message !== null){
            this.notificationService.error(result.createStoreWideDiscount.message);
          }else{
              this.notificationService.success("Price List Successfully created");
              this.priceLists=[...this.priceLists, result.createStoreWideDiscount ]
          }
        }
        this.currentlyBeingEditedPriceList= null;
      });
    }

    togglePriceList(priceList: any, event:any){
      let mutation=`
        mutation TogglePriceList{
          togglePriceList(id: ${priceList.id}){
            id
            productVariantIds
            title
            enabled
            percentDiscount
            customergroup{
              name
              id
            }
          }
        }
      `;
      this.dataService.mutate(gql(mutation)).toPromise()
      .then((result:any)=>{
        if(result.togglePriceList.id){
          for(let priceListIndex in this.priceLists){
            if(this.priceLists[priceListIndex].id === result.togglePriceList.id){
              if(result.togglePriceList.enabled){
                this.notificationService.success("Price List Successfully enabled");
              }else{
                this.notificationService.success("Price List Successfully disabled");
              }
              this.priceLists=[
                ...(this.priceLists.slice(0, parseInt(priceListIndex))), 
                result.togglePriceList,
                ...(this.priceLists.slice(parseInt(priceListIndex)+1)) ]
                return;
            }
          }
        }else{
          throw new Error();
        }
      }).catch((reason)=>{
        event.srcElement.checked= priceList.enabled;
        this.changeDetectorRef.detectChanges();
      });
    }

    showCreateModal(isDiscountStoreWide:boolean= false){
      if(isDiscountStoreWide){
        this.isDiscountStoreWide=isDiscountStoreWide;
        this.changeDetectorRef.detectChanges();
      }
      this.title='';
      this.percentDiscount='';
      this.selectedCustomerGroup=null;
      this.selectedProductVariantIds=[];
      this.currentlyBeingEditedPriceList=null;
      this.showMessage= true;
      this.changeDetectorRef.detectChanges();
    }

    showEditModal(selectedPriceList:PriceListDisplay,isDiscountStoreWide:boolean= false){
      if(isDiscountStoreWide){
        this.isDiscountStoreWide=isDiscountStoreWide;
        this.changeDetectorRef.detectChanges();
      }
      this.title= selectedPriceList.title;
      this.percentDiscount= selectedPriceList.percentDiscount;
      this.selectedCustomerGroup= selectedPriceList.customergroup;
      this.currentlyBeingEditedPriceList= selectedPriceList;
      this.selectedProductVariantIds= selectedPriceList.productVariantIds;
      this.showMessage= true;
      this.changeDetectorRef.detectChanges();
    }

    setPage(event:number){
      this.currentPage= event;
    }
  
    setItemsPerPage(event:number){
      this.itemsPerPage= event;
    }

    clearProductSelection(){
      this.selectedProductVariantIds=[];
      this.changeDetectorRef.detectChanges()
    }

    selectProductVariants() {
      console.log(this.selectedProductVariantIds);
      this.modalService
          .fromComponent(ProductMultiSelectorDialogComponent, {
              size: 'xl',
              locals:{
                mode: 'variant',
                initialSelectionIds: this.selectedProductVariantIds.map((item)=> item as string),
              }
          }).pipe(take(1)).toPromise()
          .then(result => {
              if (result && result.length) {
                this.selectedProductVariantIds= result.map((item)=> item.productVariantId);
              }
              this.changeDetectorRef.detectChanges();
          });
    }
}