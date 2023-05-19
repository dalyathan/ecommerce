import {  Component,OnInit,ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';
@Component({
    selector: 'vdr-order-map-widget',
    templateUrl: './order-map-widget.component.html',
    styleUrls: ['./order-map-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class OrderMapWidgetComponent implements OnInit {
    isListInput?: boolean | undefined;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;
    ngOnInit(): void {
        
    }
    
  }