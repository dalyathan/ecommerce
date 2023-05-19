import {  Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, FormInputComponent, } from '@etech/admin-ui/package/core';
@Component({
    template:  `
      <vdr-we-ship-to [control]="formControl" chargingMetrics="km"
      [supportsShippingFromStoreLocation]="true"
      ></vdr-we-ship-to>
    `,
  })
  export class WeShipWithLandToComponent implements FormInputComponent<CustomFieldConfig> {
    isListInput?: boolean | undefined;
    readonly: boolean;
    formControl: FormControl;
    config: CustomFieldConfig;

    
  }