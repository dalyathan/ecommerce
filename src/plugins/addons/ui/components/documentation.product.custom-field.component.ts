import { CustomFieldConfig } from '@etech/common/lib/generated-types';
import {  Component,ChangeDetectorRef,OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  FormInputComponent } from '@etech/admin-ui/package/core';
export class FileUploadState{
    index:number;
    relativeURL:string|null;
}
@Component({
    template:`
    <div class="clr-row">
       <div class="clr-col-4">
        <vdr-upload-doc [(pdfRelativePath)]="controls[0]" (setValueCallback)="uploaded($event)" [index]="0"></vdr-upload-doc>
       </div>
       <div class="clr-col-4">
        <vdr-upload-doc [(pdfRelativePath)]="controls[1]" (setValueCallback)="uploaded($event)" [index]="1"></vdr-upload-doc>
       </div>
       <div class="clr-col-4">
        <vdr-upload-doc [(pdfRelativePath)]="controls[2]" (setValueCallback)="uploaded($event)" [index]="2"></vdr-upload-doc>
       </div>
       <div class="clr-col-4">
        <vdr-upload-doc [(pdfRelativePath)]="controls[3]" (setValueCallback)="uploaded($event)" [index]="3"></vdr-upload-doc>
       </div>
    </div>
    `
  })
  export class DocumentationProductCustomFieldComponent implements FormInputComponent<CustomFieldConfig>,OnInit {
    isListInput?: boolean | undefined=true;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    controls:(string|null)[]=['','','','']
    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }
    ngOnInit(): void {
        if(this.formControl.value){
            this.controls= JSON.parse(JSON.stringify(this.formControl.value)) as string[];
            this.changeDetectorRef.detectChanges();
        }
    }

    uploaded(data:FileUploadState){
        this.controls[data.index]=data.relativeURL;
        // if(data.relativeURL){
            this.formControl.setValue(this.controls)
            this.formControl.markAsDirty();
            this.changeDetectorRef.detectChanges();
        // }
    }
  }