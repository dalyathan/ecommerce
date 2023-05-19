import {  Component,ElementRef,ChangeDetectorRef,Input,Output,EventEmitter,AfterViewInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {  NotificationService } from '@etech/admin-ui/package/core';
import { FileUploadState } from './documentation.product.custom-field.component';
@Component({
    selector:'vdr-upload-doc',
    template:`
    <div>
         <div class="card" style="width:128px;">
            <div class="card-img">
                <img src="/assets/preview/85/pdf__preview.svg.png?preset=thumb" style="width:128px;height:128px;">
            </div>
            <div class="card-block">
                <h6 class="card-title" style=" white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;">
                  <a href="#" *ngIf="previewURL !== undefined && previewURL !== null" (click)="previewFile()" title="{{fileName}}">
                      {{fileName}}
                  </a>
                </h6>
            </div>
            <div class="card-footer">
              <a class="btn btn-sm btn-link" (click)="selectFile()" *ngIf="state==0">
                Select
              </a>
              <a class="btn btn-sm btn-link" (click)="selectFile()" *ngIf="state==1 || state==3">
                Edit
              </a>
              <a class="btn btn-sm btn-link" (click)="remove()" *ngIf="(state==1 || state==3) && pdfRelativePath">
                Remove
              </a>
              <a class="btn btn-sm btn-link" (click)="uploadFile()" 
                *ngIf="state == 2" [attr.disabled]="pdfRelativePath?'disabled':null">
                Submit
              </a>
            </div>
        </div>
        <input type="file" accept=".pdf" style="display: none;" id="file-picker" (input)="pickFile($event)">
    </div>
    `
  })
  export class ProductDocComponent implements AfterViewInit {
    @Input() pdfRelativePath: string;
    @Input() index: number;
    @Output() setValueCallback: EventEmitter<FileUploadState>= new EventEmitter();
    uploadedFile: File | null=null;
    fileName:string;
    state: ButtonState;
    previewURL: string | ArrayBuffer | null;
    constructor(private elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef,
      private apollo:Apollo,private notificationService: NotificationService){

    }

    ngAfterViewInit(): void {
      if(this.pdfRelativePath !== null && this.pdfRelativePath !== undefined){
        this.state= ButtonState.EDIT;
        // let pdfRelativePath= this.control.value as string;
        this.previewURL= this.pdfRelativePath;
        this.fileName= this.pdfRelativePath.split('_')[1];
      }else{
        this.state= ButtonState.SELECT;
      }
    }

    selectFile(){
        this.elementRef.nativeElement.querySelector('#file-picker').click();
    }
    
    pickFile(event:any){
        let selectedFile:File= event.target.files[0];
        console.log(this.state);
        if(selectedFile.size > 30000000){
          this.notificationService.error('File size exceeds 30 MB');
          return;
        }
        this.uploadedFile= selectedFile;
        this.fileName= selectedFile.name;
        const reader = new FileReader();
        const self= this;
        reader.addEventListener("load", function () {
          self.previewURL = reader.result;
          self.state= ButtonState.SUBMIT_ENABLED;
          self.changeDetectorRef.detectChanges();
        }, false);
        this.setValueCallback.emit({index:this.index,relativeURL: null})
        reader.readAsDataURL(selectedFile);
    }

    previewFile(){
      if(this.previewURL !== null){
        window.open(`${this.previewURL}`, '_blank', 'fullscreen=yes'); 
      }
      return false;
    }

    remove(){
      this.fileName='';
      this.setValueCallback.emit({index:this.index,relativeURL: ''})
    }

    async uploadFile(){
      var createAssetMutation=gql`
        mutation UploadMutation(
            $assets: CreateAssetInput!
          ) {
            uploadDocumentation(input: $assets)
          }
          `;
        try{
          var reply= await this.apollo.mutate<any>({
            mutation: createAssetMutation,
            variables: {
                assets: {file: this.uploadedFile}
            },
            context: {
                useMultipart: true
            }
          }).toPromise();
          this.setValueCallback.emit({index:this.index,relativeURL: reply.data.uploadDocumentation})
          this.pdfRelativePath= reply.data.uploadDocumentation;
          this.state= ButtonState.SUBMIT_DISABLED;
        }catch(err){
            this.notificationService.error(`Couldn't upload file.`);
        };
    }
  }

  enum ButtonState{
    SELECT, EDIT, SUBMIT_ENABLED, SUBMIT_DISABLED 
  }