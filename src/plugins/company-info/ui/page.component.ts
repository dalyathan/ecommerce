
import { Component } from '@angular/core';
import { Apollo, gql, } from 'apollo-angular';
import {AssetPickerDialogComponent, ModalService, NotificationService} from '@etech/admin-ui/package/core';
import { ID } from '@etech/core';
import {take} from 'rxjs/operators';
const GET_QUERY = gql `
query GetCompanyInfos{
   getCompanyInfos{
    commercial_bank
    or_bank
    ab_bank 
    tele_birr
    dashen_bank 
     berhan_bank
     company_name 
    facebook_address
    instagram_address
    linkdin_address
    twitter_address
    telegram_address
    youtube_address
    latitude
    longtude
    email
    location_text
    phone_number
    icon{
      id
      preview
    }
  }
}
`;

const CHANGE_MUTATION = gql `
 
mutation SetCompanyInfo(
    $commercial_bank: String,
    $or_bank: String,
    $ab_bank : String,
    $tele_birr: String,
    $dashen_bank : String,
    $berhan_bank: String,
    $company_name : String,
    $facebook_address: String,
    $instagram_address: String,
    $linkdin_address: String,
    $twitter_address: String,
    $telegram_address: String,
    $youtube_address: String,
    $latitude: Float,
    $longitude: Float,
    $email: String,
    $phone_number: String
    $icon_id: ID,
    $location_text: String
)
{
  setCompanyInfo(  
    commercial_bank: $commercial_bank,
    or_bank: $or_bank,
    ab_bank : $ab_bank,
    tele_birr: $tele_birr,
    dashen_bank :  $dashen_bank,
    berhan_bank: $berhan_bank,
    company_name :   $company_name, 
     facebook_address : $facebook_address,
    instagram_address : $ instagram_address,
    linkdin_address : $linkdin_address,
    twitter_address :$twitter_address,
    telegram_address :$telegram_address,
    youtube_address:$youtube_address,
    latitude:$latitude,
    longitude:$longitude,
    email:$email,
    phone_number:$phone_number, location_text: $location_text
    icon_id: $icon_id ){
     company_name
  }
}
`;

@Component({
  
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],

})
export class GreeterComponent {
  logoAssetPreview: String | undefined = '/assets/preview/8b/bannerb__preview.webp';
  logoAssetId: ID;
   async sendVal(){
        const reply:any= await this.apollo.mutate({mutation: CHANGE_MUTATION, variables: {
                   company_name : this.company_name,
                    facebook_address: this.facebook_address,
                    instagram_address: this.instagram_address,
                    linkdin_address: this.linkdin_address,
                    twitter_address: this.twitter_address,
                    telegram_address: this.telegram_address,
                    youtube_address: this.youtube_address,
                    latitude: this.latitude,
                    longitude: this.longitude,
                    email: this.email,
                    phone_number: this.phone_number,
                    icon_id: this.logoAssetId,
                    location_text: this.location_text,
                    commercial_bank: this.commercial_bank,
                    or_bank : this.or_bank,
                    ab_bank: this.ab_bank,
                    tele_birr: this.tele_birr,
                    dashen_bank: this.dashen_bank,

                    berhan_bank: this.berhan_bank    } 
        }).toPromise();
        if(reply.data.setCompanyInfo.company_name){
          this.notificationService.success("Updated successfully");
        }else{
          this.notificationService.error("Couldnt update");
        }
   }
  
   commercial_bank ='';
   or_bank ='';
   ab_bank ='';
   tele_birr ='';
   dashen_bank ='';
   berhan_bank='';




   valTosend: any= {}
    sayHi(){
    console.log('here')
    }
   setValToSend(name: string , val: any){
      this.valTosend[name] = val;
   }
   getValue(){


   }
    markerDragEnd(m:any, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }
    mapClicked($event: any) {
    console.log($event)
  
     this.latitude = $event.coords.lat;
      this.longitude = $event.coords.lng;
    }
    title = 'My first AGM project';
    latitude = 51.678418;
    longitude = 7.809007;
  
  
  
   company_name : string;
    facebook_address: string;
    instagram_address: string
    linkdin_address: string
    twitter_address: string
    telegram_address: string
    youtube_address: string
    location_text: string
    
   
    email: string
    phone_number: string

   info: any = {}
  constructor(private apollo: Apollo, private notificationService: NotificationService, 
    private modalService: ModalService){
   
    this.apollo.query({query:GET_QUERY}).pipe(take(1)).toPromise().then(({data}) =>{
         this.info = ( data as {getCompanyInfos: any}).getCompanyInfos; 
          const info= this.info;
         this.company_name = info.company_name;
         this.facebook_address = info.facebook_address;
         this.instagram_address = info.instagram_address;
         this.linkdin_address = info.linkdin_address;
         this.twitter_address = info.twitter_address;
         this.telegram_address = info.telegram_address;
         this.youtube_address = info.youtube_address;
         this.latitude = info.latitude;
         this.location_text = info.location_text;

         this.commercial_bank = info.commercial_bank ;
         this.or_bank = info.or_bank;
         this.ab_bank = info.ab_bank;
         this.tele_birr = info.tele_birr;
         this.dashen_bank = info.dashen_bank;
         this.berhan_bank= info.berhan_bank;
      

         this.longitude = info.longtude;
         this.email = info.email;
         this.phone_number = info.phone_number;
         if(info.icon){
           this.logoAssetPreview= info.icon.preview;
         }
        // }
       
    });
  }

  async pickAsset(){
    const result= await this.modalService
    .fromComponent(AssetPickerDialogComponent, {
        size: 'xl',
    }).pipe(take(1)).toPromise();
    if (result && result.length) {
        this.logoAssetPreview= result[0].preview;
        this.logoAssetId= result[0].id;
    }
  }
}
