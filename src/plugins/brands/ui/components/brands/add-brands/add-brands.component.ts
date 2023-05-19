import { Component, OnInit,ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {gql} from 'apollo-angular';
import { Router,ActivatedRoute } from '@angular/router';
import {AssetPickerDialogComponent, ModalService,DataService,NotificationService, 
  ProductMultiSelectorDialogComponent, DeactivateAware, Asset} from "@etech/admin-ui/package/core";
import{take} from 'rxjs/operators';

@Component({
  selector: 'add-brands-vendure',
  templateUrl: './add-brands.component.html',
  styleUrls: ['./add-brands.component.scss']
})
export class AddBrandsComponent implements OnInit,DeactivateAware {
  featuredAssetId: string="";
  image: string="";
  name:string="";
  description:string="";
  routeId:string;
  initialSelectionIds:string[]=[];
  isDirty: boolean= false;
  pickedImage: Asset | undefined;
  @ViewChild('fileInput', { static: false }) public fileInput: ElementRef;
  @ViewChild('displayImg', { static: false }) public displayImg: ElementRef;
  constructor(
    private modalService:ModalService, 
    private dataService: DataService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
    ) { }

  canDeactivate(): boolean {
    return this.isDirty == false;
  }
  
  ngOnInit(): void {
   this.route.params.pipe(take(1)).toPromise().then((result)=>{
     if(result &&  result.id != null){
       this.routeId=  result.id;
       this.loadBrandToEdit();
     }else{
       this.image="assets/preview/c1/bhyuj__05__preview.jpg";
       this.changeDetectorRef.detectChanges();
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
                initialTags: ['Brand'],
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

  loadBrandToEdit(){
      let graphqlQuery= `
        query Brand{
          brand(id:${this.routeId}){
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
      this.dataService.query(gql(graphqlQuery)).mapSingle(data=> (data as any).brand).toPromise().then((result)=>{
        if(result != null){
          this.image= result.icon ? result.icon.preview:null;
          this.name= result.name;
          this.description= result.description;
          this.featuredAssetId= result.icon !== null ? result.icon.id:null;
          result.products.map((item:any)=> this.initialSelectionIds.push(item.id));
          this.changeDetectorRef.detectChanges();
        }else{
          this.router.navigate(['/extensions/catalog/list-brands']);
        }
      });
  }

  async create(){
    // console.log(this.pickedImage)
    if(this.name!=null && this.name.trim()!==''){
      let graphql=`
      mutation CreateBrand{
        createBrand(args: {
          name: "${this.name}",
          description:"${escape(this.description)}", 
          ${this.pickedImage ? `iconId: ${this.pickedImage.id},`:'' }
          productIds: [${this.initialSelectionIds}]
        }){
          id
        }
      }
      `;
      const result:any = await this.dataService.mutate(gql(graphql), this.pickedImage? {
        asset: this.pickedImage
      }:undefined).toPromise();
      this.notificationService.success('Brand has been created');
      this.isDirty= false;
      setTimeout(()=>{
        this.router.navigate(['/extensions/catalog/list-brands']);
      },1250);
    }else{
      this.notificationService.error("Please fill title and description");
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
            this.isDirty= true;
            selection.map(item =>
                this.initialSelectionIds.push(item.productId)
            );
        }
  }

  async edit(){
    if(this.name!=null && this.name.trim()!==''){
      let graphql=`
      mutation EditBrand{
        editBrand(args: {
          name: "${this.name}",
          description:"${escape(this.description)}", 
          ${this.pickedImage ? `iconId: ${this.pickedImage.id},`:'' }
          id:${this.routeId},
          productIds: [${this.initialSelectionIds}]
        }){
          id
        }
      }
      `
      ;
      const result:any = await this.dataService.mutate(gql(graphql), this.pickedImage? {
        asset: this.pickedImage
      }:undefined).toPromise();
      if(this.routeId === result.editBrand.id){
        this.notificationService.success('Brand has been edited');
        this.isDirty= false;
        setTimeout(()=>{
          this.router.navigate(['/extensions/catalog/list-brands']);
        },1250);
      }else{
        this.notificationService.error("Unexpected error. Contact the system admin");
      }
    }else{
      this.notificationService.error("Please fill title and description");
    }
  }

  clearProductSelection(){
    this.initialSelectionIds=[];
    this.changeDetectorRef.detectChanges()
  }
}