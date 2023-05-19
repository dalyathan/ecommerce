import {  Component,OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';
@Component({
    template:  `
    
    `,
  })
  export class CustomFieldComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
    isListInput?: boolean | undefined;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
    
  }