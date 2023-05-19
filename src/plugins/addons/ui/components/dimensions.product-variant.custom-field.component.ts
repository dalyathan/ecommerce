import {  Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';

export class ProductVariantDimensions{
  length: number;
  width: number;
  height: number;
}
@Component({
    template:  `
    <div class="clr-row">
      <div class="clr-col-3">
        <label>Length </label>
        <vdr-affixed-input [suffix]="'cm'">
          <input clrInput placeholder="0.0" name="input" (input)="updateVolume($event)"
          [(ngModel)]="dimension.length" size="4.5" type="number" min="0" step="0.01" style="width: 55px;"/>
        </vdr-affixed-input>
      </div>
      <div class="clr-col-3">
        <label>Width </label>
        <vdr-affixed-input [suffix]="'cm'">
          <input clrInput placeholder="0.0" name="input" (input)="updateVolume($event)"
          [(ngModel)]="dimension.width" size="4.5" type="number" min="0" step="0.01" style="width: 55px;"/>
        </vdr-affixed-input>
      </div>
      <div class="clr-col-3">
        <label>Height </label>
        <vdr-affixed-input [suffix]="'cm'">
          <input clrInput placeholder="0.0" name="input" (input)="updateVolume($event)"
          [(ngModel)]="dimension.height"  size="4.5" type="number" min="0" step="0.01" style="width: 55px;"/>
        </vdr-affixed-input>
      </div>
      <div class="clr-col-1 clr-align-self-center" style="text-align: center;">
          <span>
            {{volume}} c.m<sup>3</sup>
          </span>
      </div>
    </div>
    `,
  })
  export class DimensionsProductVariantCustomFieldComponent implements FormInputComponent<CustomFieldConfig>,OnInit {
    isListInput?: boolean | undefined=false;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    dimension:ProductVariantDimensions;
    // length:number=0.0;
    // width:number=0.0;
    // height:number=0.0;
    volume:number=0.0;
    constructor(private cdr: ChangeDetectorRef){

    }

    ngOnInit(): void {
      if(this.formControl.value){
        this.dimension= JSON.parse(this.formControl.value) as ProductVariantDimensions;
        this.volume=this.dimension.length*this.dimension.width*this.dimension.height;
      }else{
        this.dimension= {length:0.0,width:0.0,height:0.0};
        this.volume=0.0;
      }
    }
    
    updateVolume(event){
      const value= parseFloat(event.target.value);
      if(value){
        this.volume=this.dimension.length*this.dimension.width*this.dimension.height;
      }
      if(this.volume){
        this.formControl.setValue(JSON.stringify(this.dimension))
        this.formControl.markAsDirty();
      }
    }
  }