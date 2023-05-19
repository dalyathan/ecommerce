import {  CreateAssetInput, CustomFieldConfig, DataService, FormInputComponent,  } from '@etech/admin-ui/package/core';
import {  Component,AfterViewInit,ChangeDetectorRef,ElementRef,ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
@Component({
    template: `
      <div>
        <input #fileInput type="file" style="display: none;" (change)="filePicked($event)">
        <button class="btn btn-primary" (click)="selectAsset(false)" *ngIf="!signatureUrl && !pickedImage">
           Select Signature
        </button>
        <button class="btn btn-primary" (click)="selectAsset(true)" *ngIf="signatureUrl && !pickedImage">
           Update Signature
        </button>
        <button class="btn btn-primary" (click)="uploadAsset()" *ngIf="pickedImage">
            Upload Signature
        </button>
        <img #displayImg style="width: 10vw;height: 4.75vh;color: transparent;" alt="sig" accept="image/png"/>
      </div>
      <small>Please make sure the image has a PNG format, no background and contains only your signature</small>
    `,
  })
  export class AdminSignatureComponent implements FormInputComponent<CustomFieldConfig>, AfterViewInit {
      isListInput?: boolean | undefined;
      readonly: boolean;
      formControl: FormControl;
      config: CustomFieldConfig;
      signatureUrl:string;
      deleteCurrent:boolean= false;
      pickedImage: File|undefined;
      @ViewChild('displayImg', { static: false }) public displayImg: ElementRef;
      @ViewChild('fileInput', { static: false }) public fileInput: ElementRef;
      constructor(private cdr: ChangeDetectorRef, private apollo: Apollo,
        private dataService: DataService, ){

      }
    ngAfterViewInit(): void {
        if(this.formControl.value && (this.formControl.value as string).length){
            this.signatureUrl= (this.formControl.value as string).split(',')[1];
            this.displayImg.nativeElement.src = this.signatureUrl;
            this.cdr.detectChanges();
        }
      }

      filePicked(eventData:any){
        let tryImage:File= eventData.srcElement.files[0];
        if(tryImage && tryImage.name.split('.')[1]==='png'){
          this.pickedImage=tryImage;
          var fileReader = new FileReader();
          let src= this;
          fileReader.onloadend = function() {
            src.displayImg.nativeElement.src = fileReader.result;
          }
          fileReader.readAsDataURL(this.pickedImage);
          if(this.deleteCurrent){
            this.dataService.product.deleteAssets([this.formControl.value.split(',')[0]], true);
          }
          this.cdr.detectChanges();
        }
      }

      selectAsset(update:boolean=false) {
        this.deleteCurrent=update;
        this.fileInput.nativeElement.click();
      }

      async uploadAsset(){
        var assets:CreateAssetInput[]=[{file: this.pickedImage, tags: ["logo"]}];
        var createAssetMutation=gql`
            mutation UploadMutation(
                $assets: [CreateAssetInput!]!
            ) {
                createAssets(input: $assets) {
                    ...on Asset{
                        id
                        preview
                    }
                    ...on MimeTypeError{
                        message
                    }
                }
            }
        `;
        var reply= await this.apollo.mutate<any>({
        mutation: createAssetMutation,
        variables: {
            assets: assets
        },
        context: {
            useMultipart: true
        }
        }).toPromise();
        // this.dataService.product.ass
        let sigURL= `${(reply.data.createAssets[0].id as string)},/assets${((reply.data.createAssets[0].preview as string) as string).split('assets')[1]}`;
        this.formControl.setValue(sigURL);
        this.formControl.markAsDirty();
        this.pickedImage= undefined;
        this.cdr.detectChanges();
      }

  }