import {  Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CustomFieldConfig, DataService, FormInputComponent, } from '@etech/admin-ui/package/core';
import {ActivatedRoute} from '@angular/router';
import{take} from 'rxjs/operators';
@Component({
    template:  `
      <vdr-we-ship-to [control]="formControl" chargingMetrics="hr"
      [supportsShippingFromStoreLocation]="supportsShippingFromStoreLocation"
      ></vdr-we-ship-to>
    `,
})
export class WeShipWithAirToComponent implements FormInputComponent<CustomFieldConfig>, OnInit {
  isListInput?: boolean | undefined;
  readonly: boolean;
  formControl: FormControl;
  config: CustomFieldConfig;
  supportsShippingFromStoreLocation: boolean=true;
  constructor(private route:ActivatedRoute,private dataService: DataService,
    private cdr: ChangeDetectorRef){

  }
  async ngOnInit(): Promise<void> {
    const routeData:any= await this.route.params.pipe(take(1)).toPromise();
    this.dataService.shippingMethod.getShippingMethod(routeData.id).valueChanges
    .subscribe(({ data, loading })=>{
      if(!loading){
        this.supportsShippingFromStoreLocation=data.shippingMethod.customFields.supports_shipping_to_store_location;
        this.cdr.detectChanges();
      }
    });
  }
  
}