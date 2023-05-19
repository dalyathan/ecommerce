import {  Component,OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import {take} from 'rxjs/operators';
import { CustomFieldConfig, FormInputComponent, ModalService, NotificationService, ProductMultiSelectorDialogComponent } from '@etech/admin-ui/package/core';
@Component({
  selector: 'view-product-accessories',
  templateUrl: './accessories.product.custom-field.component.html',
  styleUrls: ['./accessories.product.custom-field.component.scss']
  })
  export class ProductAccessoriesCustomFieldComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
    isListInput=false;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    productIds: string[]=[];
    currentProductId: string|null;
    constructor(private modalService: ModalService, private notificationService: NotificationService,
      private cdr: ChangeDetectorRef){
      let urlArray:string[]=window.location.pathname.split('/');
       this.currentProductId = parseInt(urlArray[urlArray.length-1]).toString();
    }
    
    ngOnInit(): void {
      let value:string=this.formControl.value as string;
      if(value && value.trim().length){
        this.productIds= value.split(',');
      }
    }

    async selectProducts(){
      const selection= await this.modalService.fromComponent(ProductMultiSelectorDialogComponent, {
          size: 'xl',
          locals: {
              mode: 'product',
              initialSelectionIds: this.productIds,
              allowCreateProduct: false,
          },
      }).pipe(take(1)).toPromise();
          if (selection) {
              let idBuffer:string[]=[]
              selection.map(item =>{
                if(item.productId!=this.currentProductId){
                  idBuffer.push(item.productId)
                }else{
                  this.notificationService.warning(`Can't add a product ${item.productName} as an accessory`)
                }
              }
              );
              if(idBuffer.length){
                this.formControl.setValue(idBuffer.join(','));
                this.productIds=idBuffer;
                this.formControl.markAsDirty();
              }
              this.cdr.detectChanges();
                //this.formControl.markAsTouched();
          }
      // });
    }

    clearProductSelection(){
      this.productIds=[];
      this.formControl.setValue('');
      this.formControl.markAsDirty();
    }

}