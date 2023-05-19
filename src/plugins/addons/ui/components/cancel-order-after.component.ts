import {  Component,OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';
@Component({
    template:  `
    <div class="clr-row">
        <div class="clr-col-4">
            <input type="number" [(ngModel)]="days" clrInput step="1" min="0" max="15" style="width: 80px; display:inline !important;" (change)="calculateMinutes()"/> days
        </div>
        <div class="clr-col-6">
            <input type="number" clrInput [(ngModel)]="hrs" step="1" min="0" max="23" style="width: 80px;display:inline !important;" (change)="calculateMinutes()"/> hrs
        </div>
        <div class="clr-col-2">
        <input type="number" clrInput step="1" [(ngModel)]="minutes" min="0" max="59" style="width: 80px;display:inline !important;" (change)="calculateMinutes()"/> minutes
        </div>
    </div>
    `,
  })
  export class CancelOrderAfterGlobalSettingComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
      isListInput?: boolean | undefined;
      readonly: boolean;
      formControl: FormControl;
      config: CustomFieldConfig;
      days:number;
      hrs:number;
      minutes:number;

      ngOnInit(): void {
          let totalMinutes= this.formControl.value as number;
          if(totalMinutes >0){
            this.days= Math.floor(totalMinutes/(24*60))
            totalMinutes-=(this.days * 24 * 60);
            if(totalMinutes>0){
                this.hrs= Math.floor((totalMinutes - this.days*24)/60)
                totalMinutes-=(this.hrs * 60);
                if(totalMinutes>0){
                    this.minutes= Math.floor((totalMinutes- this.hrs*60));
                    totalMinutes-=(this.minutes);
                }else{
                    this.minutes=0;
                }
            }else{
                this.hrs= this.minutes=0;
            }
            if(totalMinutes>0){
                alert(totalMinutes);
            }
          }
          else{
              this.hrs= this.days= this.minutes=0;
              this.formControl.setValue(0);
          }
      }

      calculateMinutes(){
        let value= this.days*60*24+this.hrs*60+this.minutes;
        this.formControl.setValue(value);
        this.formControl.markAsDirty();
        }

  }