import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {gql} from 'apollo-angular';
import { FormControl } from '@angular/forms';
import {DataService,ModalService} from "@etech/admin-ui/package/core";
import { CustomFieldConfig } from '@etech/common/lib/generated-types';
import { FormInputComponent } from '@etech/admin-ui/package/core';

@Component({
  selector: 'choose-brands-vendure',
  templateUrl: './choose-brand.component.html',
  styleUrls: ['./choose-brand.component.scss']
})
export class ChooseBrandComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
  salesList: any[]=[];
  salesListIsLoading: boolean= true;
  readonly: boolean;
  config: CustomFieldConfig;
  formControl: FormControl;
  dummySelectModel:any=null;

  constructor(private dataService: DataService, private modalService: ModalService, private changedetectRef: ChangeDetectorRef) {    
  }
  ngOnInit(): void {
    this.add();
  }

  async add(){
    const brandsGraphql=`query AllBrands{
      brands{
        id
        name
        description
      }
    }`;
    this.dataService.query(gql(brandsGraphql)).mapSingle(data=> (data as any).brands).toPromise().then((result)=>{
      this.salesListIsLoading= false;
      this.salesList= result;
      if(this.formControl.value != null){
        for(var item of result){
          if(this.formControl.value.id == (item as any).id){
            this.dummySelectModel= item;
          }
        }
      }
      this.changedetectRef.detectChanges();
    });
  }

  updateFormControl(){
    this.formControl.setValue(this.dummySelectModel);
    this.formControl.markAsDirty();
  }
}