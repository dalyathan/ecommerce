import {  Component,OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  FormInputComponent, ModalService, NotificationService,  } from '@etech/admin-ui/package/core';
import { CustomFieldConfig } from '@etech/common/lib/generated-types';
import { FirebaseDialogComponent } from '@etech/admin-ui/package/login';

@Component({
    template: `
    (+251)
      <input 
          (input)="checkNumber($event)"
          clrInput
          [value]="showValue"
          type="tel"
      />
    `,
  })
  export class AdminPhoneNumberComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
    readonly: boolean;
    config: CustomFieldConfig;
    formControl: FormControl;
    showValue: string;

    constructor(private modalService: ModalService,private notificationService: NotificationService){
    }
    ngOnInit(): void {
        if(this.formControl.value){
            let current= (this.formControl.value as string).split('+251')[1];
            if(current){
                this.showValue= current;
            }else{
                this.showValue="";
            }
        }else{
            this.showValue="";
        }
    }

    checkNumber(event:any){
        let value=event.target.value as string;
        if( /^\d+$/.test(value) && value.length == 10 ){
            let withCountryCode:string=`+251${value.substring(1)}`;
            this.modalService
            .dialog({
                title: 'Verify Phone Number',
                body: `We would like to send a code to ${withCountryCode} to check if it's really yours.`,
                buttons: [
                    { type: 'secondary', label: 'ok', returnValue: true },
                    { type: 'danger', label: 'cancel', returnValue: false },
                ],
            }).toPromise().then(async (value)=>{
              if(value){
                let reply= await this.modalService.fromComponent(FirebaseDialogComponent,
                    {
                        size: 'md',
                        closable: false,
                        locals: { phoneNumber:withCountryCode },
                    }).toPromise();
                if(reply){
                    this.notificationService.success('Successfully Verified');
                    this.formControl.setValue(withCountryCode);
                    this.formControl.markAsDirty();
                }else{
                    this.notificationService.error("Phone Number couldn't be verified");
                }
              }
            });
        }else{
            if((value as string).trim() === ''){
                this.formControl.setValue('');
                this.formControl.markAsDirty();
            }
        }
    }
  }