import {  Component,OnInit,ChangeDetectorRef,Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotificationService, } from '@etech/admin-ui/package/core';
import {CityDetail} from '../../types';
@Component({
  selector: 'vdr-we-ship-to',
  templateUrl: './we-ship-to.component.html',
  styleUrls: ['./we-ship-to.component.scss'],
  })
  export class WeShipComponent implements /*FormInputComponent<CustomFieldConfig>,*/ OnInit {
    @Input() control: FormControl;
    @Input() chargingMetrics:String;
    @Input() supportsShippingFromStoreLocation:boolean;
    selectedIndex:number=0;
    dataList:CityDetail[]=[];
    constructor(private cdr: ChangeDetectorRef, private ns: NotificationService){

    }

    ngOnInit(): void {
      this.selectedIndex= 0;
      if(this.control.value){
        this.dataList= this.control.value as CityDetail[];
        this.selectedIndex= this.dataList.findIndex((item)=> item.isStoreLocation);
      }
      this.cdr.detectChanges();
    }

    addACity(){
      this.dataList= [...(this.dataList),
        {
          city:'', 
          distanceFromStoreLocation:0, 
          isStoreLocation: !(this.dataList.length), 
          id: this.dataList.length+1
        }
      ]
      this.cdr.detectChanges();
    }

    onDelete(data:CityDetail){
      if(this.selectedIndex === this.dataList.findIndex((item)=> item.id === data.id)){
        this.ns.error("Can't remove store location from list of cities")
        return;
      }
      this.dataList= this.dataList.filter((item)=> item.id != data.id);
      this.cdr.detectChanges();
      this.ns.success("Successfully removed city")
      this.makeFormReadyToSubmit();
    }
      
    makeFormReadyToSubmit(){
      const missingField=this.dataList.some((item)=> !item.city 
      || item.city.trim() === '' || 
      (item.isStoreLocation? 
        this.supportsShippingFromStoreLocation? 
          item.distanceFromStoreLocation==0
          :false
        :item.distanceFromStoreLocation==0));
      if(missingField){
        this.control.markAsPristine();
      }else{
        const value=JSON.stringify(this.dataList);
        this.control.setValue(value);
        this.control.markAsDirty();
      }
    }

    cityValueChanged(event: any,id:number){
      const itemIndex= this.dataList.findIndex((item)=> item.id==id);
      if( this.dataList.some((item)=> item.id!=id &&  item.city.toLowerCase() 
      === (event.target.value as string).toLowerCase())){
        this.ns.error(`City ${event.target.value} already exists`)
      }
      this.dataList=[...(this.dataList.slice(0, itemIndex)),{
        city: event.target.value,
        distanceFromStoreLocation: this.dataList[itemIndex].distanceFromStoreLocation,
        id: id,
        isStoreLocation: this.dataList[itemIndex].isStoreLocation
      },...(this.dataList.slice(itemIndex+1))]
      this.makeFormReadyToSubmit();
    }

    kmsValueChanged(event: any,id:number){
      const itemIndex= this.dataList.findIndex((item)=> item.id==id);
      this.dataList=[...(this.dataList.slice(0, itemIndex)),{
        city: this.dataList[itemIndex].city,
        distanceFromStoreLocation: event.target.value,
        id: id,
        isStoreLocation: this.dataList[itemIndex].isStoreLocation
      },...(this.dataList.slice(itemIndex+1))]
      this.makeFormReadyToSubmit();
    }

    isStoreLocationValueChanged(newValue: CityDetail){
      if(newValue.id != this.dataList[this.selectedIndex].id){
        const aboutTobeSelected= this.dataList.findIndex((item)=> item.id == newValue.id);
        this.dataList=[
          ...(this.dataList.slice(0, aboutTobeSelected).map((item) => {
            item.isStoreLocation= false;
            return item;
          })),{
            ...(this.dataList[aboutTobeSelected]),
            isStoreLocation: true
          },
          ...((aboutTobeSelected+1<=this.dataList.length-1)?(
            this.dataList.slice(aboutTobeSelected+1).map((item) => {
              item.isStoreLocation= false;
              return item;
            })):[])
          ]
          this.selectedIndex= aboutTobeSelected;  
          this.makeFormReadyToSubmit();
      }
    }
  }