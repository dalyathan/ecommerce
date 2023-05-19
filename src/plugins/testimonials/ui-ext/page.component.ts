

import { Component,ChangeDetectorRef } from '@angular/core';
import { Apollo, gql, } from 'apollo-angular';
import { AssetService, ID } from '@etech/core';
import {DomSanitizer} from '@angular/platform-browser';
import {AssetPickerDialogComponent, DataService, ModalService, NotificationService, TEST_SHIPPING_METHOD} from '@etech/admin-ui/package/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {take} from 'rxjs/operators';
const CHANGE_PIC_MUTATION = gql `
 mutation  SetTestimonialPicture($id: ID!, $pic_loc: String!){
  setTestimonialPicture(id: $id, pic_loc: $pic_loc){
    id
    pic_location
    msg
    name 
    person_position
  }
 }
`;

const LIST_QUERY = gql `
      query GetTestimonials{
        getTestimonials{
          id
          pic_location
          msg
          name 
          person_position

        }
      }
`;

const CREATE_MUTATION  = gql `
mutation CreateTestimonial(
  $name: String! 
  $position: String! 
  $msg: String!
){
  createTestimonial(name: $name, 
    position: $position,
    msg: $msg
  ){
    id
  }

}

`;

const REMOVE_MUTATION = gql`
mutation RemoveTestimonial($id: ID!){
  removeTestimonial(id: $id){
    id
    pic_location
    msg
    name 
    person_position
  }
}
`;
@Component({
  
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],

})
export class GreeterComponent {
  logoAssetPreview: String | undefined = `/assets/preview/8b/bannerb__preview.webp`;
  logoAssetId: ID;
  isModalVisible = false;
  async changePic(id: string){
      await this.ImageDialog()
      this.changetTestPic(id, this.logoAssetId + '')
      this.changeDetectionRef.detectChanges();
  }
  getPicLocation(uri){
     /*TODO:: CHANGE THIS LATTER to an envoirment var*/
    return '/assets/' + uri
  }
  changetTestPic(id: string, pic_loc: string){
     this.apollo.mutate({mutation: CHANGE_PIC_MUTATION, variables: {id, pic_loc}})
     .pipe(take(1)).toPromise().then((result)=>
     {
      this.testimonials = (result as any).data.setTestimonialPicture;
      this.logoAssetPreview="";
      this.notificationService.success("Testimonial successfuly updated");
    })
  }
  async removeTest(id: string){
    let response= await this.modalService
            .dialog({
                title: 'Delete Testimonail',
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            }).toPromise()
      if(response){
        this.apollo.mutate({mutation: REMOVE_MUTATION, variables: {id}})
        .pipe(take(1)).toPromise().then((result)=>
        {
         this.testimonials = (result as any).data.removeTestimonial;
         this.notificationService.success("Testimonial deleted successfully");
       })
      }
  }

  makeInlineCssSafe(content:string){
    return this.sanitized.bypassSecurityTrustHtml(content)
  }

  async addTest(name: string, msg: string, position: string){
    const mutation_result = await this.apollo.mutate({mutation: CREATE_MUTATION, variables: {name, msg, position}})
    .toPromise()
    console.log({mutation_result})
    const data = mutation_result.data
    console.log({data})
    if(data){

      const id = (data as {createTestimonial: any}).createTestimonial.id
      this.changetTestPic(id, this.logoAssetId + '')

    }

  }

  async ImageDialog(){
    const result = await(this.modalService
    .fromComponent(AssetPickerDialogComponent, {
        size: 'xl',
    }).toPromise() as any);
    if (result && result.length) {
              this.logoAssetPreview= result[0].preview;
              this.logoAssetId= result[0].id;
              console.log(this.logoAssetId)
      }

  
  }
  modalName:string = ''
  modalMsg:string = ''
  modalPos:string = ''
  modalImage = ''
  async submit(){
    if(this.modalName.trim()=='' || this.modalMsg.trim()=='' || this.modalPos.trim()==''){
      this.isModalVisible = false;
      this.modalService
            .dialog({
                title: 'Missing fields',
                body: 'Please fill all fields',
                buttons: [
                    { type: 'secondary', label: 'ok' },
                    //{ type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            }).toPromise().then((value)=>{
              this.isModalVisible = true;
            });
    }else{
        this.addTest(this.modalName, this.modalMsg, this.modalPos).then(()=>{
          this.notificationService.success('Testimonial Added Successfully');
          this.modalMsg="";
          this.modalName="";
          this.modalPos="";
        });
        this.isModalVisible= false;
    }
  }
  testimonials: any[]
  constructor(private apollo: Apollo,  
    private modalService: ModalService,
    public sanitized: DomSanitizer, 
    private dataService: DataService,
    private changeDetectionRef: ChangeDetectorRef,
    private notificationService: NotificationService){
    this.dataService.query( LIST_QUERY)
    .mapSingle(data=> data).toPromise().then((result) =>{
         //console.log(data)
        //  if(!loading){
        this.testimonials = (result as {getTestimonials: any[]}).getTestimonials
        //  }
    })
  }
}
