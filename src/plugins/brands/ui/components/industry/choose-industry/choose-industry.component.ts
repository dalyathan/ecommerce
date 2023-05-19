import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import {gql} from 'apollo-angular';
import { FormControl } from '@angular/forms';
import {DataService,ModalService} from "@etech/admin-ui/package/core";
import { CustomFieldConfig } from '@etech/common/lib/generated-types';
import { FormInputComponent } from '@etech/admin-ui/package/core';

@Component({
  selector: 'choose-industries-vendure',
  templateUrl: './choose-industry.component.html',
  styleUrls: ['./choose-industry.component.scss']
})
export class ChooseIndustryComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
  isListInput?: boolean | undefined= true;
  salesList: any[]=[];
  salesListIsLoading: boolean= true;
  readonly: boolean;
  config: CustomFieldConfig;
  formControl: FormControl;
  dummySelectModel:any[]=[];


  constructor(private dataService: DataService, 
    private modalService: ModalService,
    private changedetectRef: ChangeDetectorRef) {    
  }


  ngOnInit(): void {
    this.add();
  }

  async add(){
    const brandsGraphql=`query AllIndustries{
      industries{
        id
        name
        description
      }
    }`;
    this.dataService.query(gql(brandsGraphql)).mapSingle(data=> (data as any).industries).toPromise().then((result)=>{
      this.salesList= result;
      this.salesListIsLoading= false;
      if(this.formControl.value != null){
        for(var item of result){
          if((this.formControl.value as any[]).find((one)=> one.id === item.id)){
            this.dummySelectModel.push(item);
          }
        }
      }
      this.changedetectRef.detectChanges();
    });
  }

  updateFormControl(){
    if(this.dummySelectModel && this.dummySelectModel.filter((item)=> item!== null).length){
      this.formControl.setValue(this.dummySelectModel);
    }else{
      this.formControl.setValue([]);
    }
    this.formControl.markAsDirty();
  }
}