import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import {gql} from 'apollo-angular';
import { Router,ActivatedRoute } from '@angular/router';
import {Asset, AssetPickerDialogComponent, ModalService,DataService,NotificationService, ProductMultiSelectorDialogComponent, DeactivateAware} from "@etech/admin-ui/package/core";
import {take} from 'rxjs/operators';

@Component({
  selector: 'add-industry-vendure',
  templateUrl: './add-industry.component.html',
  styleUrls: ['./add-industry.component.scss']
})
export class AddIndustryComponent implements OnInit, DeactivateAware {
  featuredAssetId: string="";
  image: String="";
  name:string="";
  description:string="";
  routeId:string;
  isDirty: boolean= false;
  initialSelectionIds:string[]=[];
  pickedImage: Asset | undefined;
  @ViewChild('fileInput', { static: false }) public fileInput: ElementRef;
  @ViewChild('displayImg', { static: false }) public displayImg: ElementRef;


  constructor(
    private modalService:ModalService, 
    private dataService: DataService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef

    ) { }
    
    canDeactivate(): boolean {
      return this.isDirty == false;
    }

    ngOnInit(): void {
       this.route.params.pipe(take(1)).toPromise().then((result)=>{
        if(result['id'] != null){
          this.routeId= result['id'];
          this.loadIndustryToEdit();
        }
      });
    }

    markAsDirty(){
      this.isDirty= true;
    }
  
  // selectAsset() {
  //   this.fileInput.nativeElement.click();
  // }

    resetAsset(){
      this.displayImg.nativeElement.src=this.image;
      this.pickedImage= undefined;
    }

    removeSelectedImage(){
      this.displayImg.nativeElement.src=undefined;
      this.pickedImage= undefined;
    }

    async selectAsset() {
      const result= await this.modalService
          .fromComponent(AssetPickerDialogComponent, {
              size: 'xl',
              locals:{
                  initialTags: ['Industry']
              }
          }).pipe(take(1)).toPromise();
              if (result && result.length) {
                this.pickedImage= result[0];
                this.displayImg.nativeElement.src=this.pickedImage.source;
              }
    }

  // filePicked(eventData:any){
  //   this.pickedImage=eventData.srcElement.files[0];
  //   if(this.pickedImage){
  //     var fileReader = new FileReader();
  //     let src= this;
  //     fileReader.onloadend = function() {
  //       src.displayImg.nativeElement.src = fileReader.result;
  //     }
  //     fileReader.readAsDataURL(this.pickedImage);
  //     this.changeDetectorRef.detectChanges();
  //   }
  // }

  loadIndustryToEdit(){
    let graphqlQuery= `
      query Industry{
        industry(id:${this.routeId}){
          name
          description
          icon{
            id
            preview
          }
          products{
            id
          }
        }
      }
    `;
    this.dataService.query(gql(graphqlQuery)).mapSingle(data=> (data as any).industry).toPromise().then((result)=>{
      if(result !== null){
        this.image= result.icon !== null? result.icon.preview:null;
        console.log(this.image);
        this.name= result.name;
        this.featuredAssetId= result.icon !== null ? result.icon.id:null;
        this.description= result.description;
        if(result.products){
          result.products.map((item:any)=> this.initialSelectionIds.push(item.id));
        }
        this.changeDetectorRef.detectChanges();
      }else{
        this.router.navigate(['/extensions/catalog/list-industries']);
      }
    });
}

  async create(){
    console.log('create')
    if(this.image != null  && this.name!=null && 
      this.name.trim()!==''){
      var graphql=`mutation CreateIndustry{
        createIndustry(args: {
          name: "${this.name}",
          description:"${escape(this.description)}", 
          ${this.pickedImage ? `iconId: ${this.pickedImage.id},`:'' }
          productIds: [${this.initialSelectionIds}]
        }){
          id
        }
      }`;
      const result:any = await this.dataService.mutate(gql(graphql), this.pickedImage? {
        asset: this.pickedImage
      }:undefined).toPromise();
      this.notificationService.success('Industry has been created');
      this.isDirty= false;
      setTimeout(()=>{
        this.router.navigate(['/extensions/catalog/list-industries']);
      },1250);
    }else{
      this.notificationService.error("Please fill title and description");
    }
  }

  async edit(){
    console.log('edit')
    if(this.name!=null && 
      this.name.trim()!==''){
      let graphql=`
      mutation EditIndustry{
        editIndustry(args: {
          name: "${this.name}",
          description:"${escape(this.description)}", 
          ${this.pickedImage ? `iconId: ${this.pickedImage.id},`:'' }
          id:${this.routeId},
          productIds: [${this.initialSelectionIds}]
        }){
          id
        }
      }`;
      const result:any = await this.dataService.mutate(gql(graphql), this.pickedImage? {
        asset: this.pickedImage
      }:undefined).toPromise();
      if(this.routeId === result.editIndustry.id){
        this.notificationService.success('Industry has been edited');
        this.isDirty= false;
        setTimeout(()=>{
          this.router.navigate(['/extensions/catalog/list-industries']);
        },1250);
      }else{
        this.notificationService.error("Unexpected error. Contact the system admin");
      }
    }else{
      this.notificationService.error("Please fill title");
    }
  }

  async select() {
    const selection= await this.modalService
        .fromComponent(ProductMultiSelectorDialogComponent, {
            size: 'xl',
            locals: {
                mode: 'product',
                initialSelectionIds: this.initialSelectionIds,
                allowCreateProduct: false,
            },
        }).pipe(take(1)).toPromise();
        if (selection) {
            this.initialSelectionIds=[];
            this.isDirty = true;
            selection.map(item =>
                this.initialSelectionIds.push(item.productId)
            );
        }
  }

  clearProductSelection(){
    this.initialSelectionIds=[];
    this.changeDetectorRef.detectChanges()
  }

}