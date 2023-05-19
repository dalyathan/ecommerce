import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild, ElementRef} from "@angular/core";
import {Type} from "../../../generated-types";
import {AssetPickerDialogComponent, CreateAssetInput, DataService, ModalService,  NotificationService,  ProductMultiSelectorDialogComponent,  ProductSelectorSearch,} from "@etech/admin-ui/package/core";
import {CmsResolver} from "../../../providers/routing/cms-resolver";
import {DomSanitizer} from '@angular/platform-browser';
import { Apollo, gql } from 'apollo-angular';
import {
    take
 } from 'rxjs/operators';
interface BigSaleObject {
    productSlug: string,
    buttonText: string,
    productAsset: string | undefined,
    banner: string,
    productVariantName: string,
    sku: string,
    productVariantId: string,
}

@Component({
    selector: 'big-sale',
    templateUrl: './big-sale.component.html',
    styleUrls: ['./big-sale.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
})
export class BigSaleComponent implements OnInit {
    // bigSaleObject: BigSaleObject = {productSlug: "", buttonText: "", productAsset: "", productVariantName: "", sku: ""};
    bigSales: BigSaleObject[]=[];
    type: Type = Type.BIG_SALE;
    images: File[];
    @ViewChild('fileInput1', { static: false }) public fileInput1: ElementRef;
    @ViewChild('displayImg1', { static: false }) public displayImg1: ElementRef;
    @ViewChild('fileInput2', { static: false }) public fileInput2: ElementRef;
    @ViewChild('displayImg2', { static: false }) public displayImg2: ElementRef;
    @ViewChild('fileInput3', { static: false }) public fileInput3: ElementRef;
    @ViewChild('displayImg3', { static: false }) public displayImg3: ElementRef;

    constructor(
        private modalService: ModalService,
        protected dataService: DataService,
        private apollo: Apollo,
        private cmsResolver: CmsResolver,
        public sanitized: DomSanitizer,
        private cdr: ChangeDetectorRef,
        private ns: NotificationService,
    ) {
    }

    ngOnInit(): void {
        this.getCms();
        if(this.bigSales.length==0){
           this.bigSales.push({banner:"",productSlug: "", productVariantId: "",  buttonText: "", productAsset: "", productVariantName: "", sku: ""});
           this.bigSales.push({banner:"",productSlug: "",  productVariantId: "", buttonText: "", productAsset: "", productVariantName: "", sku: "",});
           this.bigSales.push({banner:"",productSlug: "",  productVariantId: "", buttonText: "", productAsset: "", productVariantName: "", sku: ""});
       }
        this.images=[];
    }

    makeInlineCssSafe(content:string){
        return this.sanitized.bypassSecurityTrustHtml(content)
    }

    async update(): Promise<void> {
        // await this.createAssets();
        // console.log(this.bigSales);
        for(let saleId in this.bigSales){
            let sale= this.bigSales[saleId];
            if(sale.banner !== "" && sale.productSlug !== "" && 
            sale.productVariantId !== "" && sale.buttonText !== "" && 
            sale.productAsset !== "" && sale.productVariantName !== "" && 
            sale.sku !== ""){
                continue;
            }else{
                let value:string= saleId==='0'?"'st":saleId==="1"?"'nd":"'rd"; 
                this.ns.error(`Please fill all fields in the ${parseInt(saleId)+1}${value} sale`);
                return;
            }
        }
        let updateInput = {
            content: [JSON.stringify(this.bigSales)],
            // featuredAssetId: this.featuredAssetId,
            cmsType: this.type,
            // assetIds: [this.featuredAssetId]
        }
        this.cmsResolver.updateCms(updateInput, this.type.toString())
    }

    getCms() {
        this.cmsResolver.getCms([this.type]).toPromise().then(result => {
            result?.forEach((cms) => {
                if (cms.cmsType === this.type) {
                   this.bigSales=(JSON.parse(cms?.content?.join()!) as string[]).map<BigSaleObject>((item)=>{
                       let jsonedItem= JSON.parse(item);
                       console.log(jsonedItem);
                        return {
                            banner:jsonedItem.banner,
                            productSlug: jsonedItem.productSlug, 
                            productVariantId: jsonedItem.productVariantId,  
                            buttonText: jsonedItem.buttonText, 
                            productAsset: jsonedItem.productAsset, 
                            productVariantName: jsonedItem.productVariantName, 
                            sku: jsonedItem.sku
                        }
                   }
                   );
                }
            })
        })
    }

    filePicked(eventData:any, ref:any, offset: number){
        // this.pickedImage=eventData.srcElement.files[0];
        if(eventData.srcElement.files[0]){
            this.images[offset]= eventData.srcElement.files[0];
            var fileReader = new FileReader();
            fileReader.onloadend = function() {
            ref.src = fileReader.result;
            }
            fileReader.readAsDataURL(eventData.srcElement.files[0]);
            this.cdr.detectChanges();
        }
    }

    // selectAsset(ref:any) {
    //     console.log(ref);
    //     ref.click();
    // }
    
    async select(offset:number) {
        // console.log([this.bigSales[offset].productVariantId]);
        const selection= await this.modalService
            .fromComponent(ProductMultiSelectorDialogComponent, {
                size: 'xl',
                locals: {
                    // mode: 'variant',
                    initialSelectionIds: [this.bigSales[offset].productVariantId],
                    allowCreateProduct: false,
                    multiSelect: false,
                },
            }).pipe(take(1)).toPromise();
            if (selection && selection.length) {
                this.bigSales[offset].productAsset= selection[0].productAsset? selection[0].productAsset.preview:undefined;
                this.bigSales[offset].productVariantName= selection[0].productVariantName;
                this.bigSales[offset].sku= selection[0].sku;
                this.bigSales[offset].productVariantId= selection[0].productVariantId;
                this.cdr.detectChanges();
            }
      }

    selectProduct(event:ProductSelectorSearch.Items,offset:number) {
        this.bigSales[offset].productAsset= event.productAsset? event.productAsset.preview:undefined;
        this.bigSales[offset].productVariantName= event.productVariantName;
        this.bigSales[offset].sku= event.sku;
        this.bigSales[offset].productVariantId= event.productVariantId;
        this.cdr.detectChanges();
        // this.dataService.product.getProductVariants
        // console.log(event);
    }

    clearProductSelection(offset:number){
        this.bigSales[offset].productAsset= "";
        this.bigSales[offset].productVariantName= "";
        this.bigSales[offset].sku= "";
        this.bigSales[offset].productVariantId= "";
        this.cdr.detectChanges();
    }

    async selectAsset(offset:number) {
        const result= await this.modalService
            .fromComponent(AssetPickerDialogComponent, {
                size: 'xl',
                locals:{
                    // initialTags: ['Brand'],
                    multiSelect: false,
                }
            }).pipe(take(1)).toPromise();
            if (result && result.length) {
                this.bigSales[offset].banner= '/assets'+result[0].preview.split('assets')[1];
                this.cdr.detectChanges();
            }
      }
}
