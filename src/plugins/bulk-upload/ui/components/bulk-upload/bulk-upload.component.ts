import { ChangeDetectionStrategy, Component, ElementRef, ChangeDetectorRef} from '@angular/core';
import readXlsxFile, { Row } from 'read-excel-file';
import writeXlsxFile from 'write-excel-file';
import { Apollo } from 'apollo-angular';
import {PossibleProduct, UploadStatus} from './entities';
import {ActualProduct, ActualProductVariant} from '../../generated-admin-types';
import { DeactivateAware, TEST_SHIPPING_METHOD } from '@etech/admin-ui/package/core';
import { UpdatedCreationHelper } from './updated-creation-helper';
import { BulkUploadDataService } from '../../services/upload-bulk-upload-data.service';
@Component({
    selector: 'vdr-bulk-upload',
    templateUrl: './bulk-upload.component.html',
    styleUrls: ['./bulk-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkUploadComponent implements DeactivateAware
{
    excelFile:File | null;
    images:File[] | null;
    columns:string[]=['Featured Asset','Name', 'Description','SKU','Price','Stock'];
    currentPage: number =1;
    itemsPerPage: number=10;
    itemsList: PossibleProduct[]=[];
    excelColumns:string[]=['Name', 'Description','SKU','Price','Stock', 'Option Groups', 'This Variant\'s Values', 'Featured Asset', 'Main Product'];
    showMessage: boolean= false;
    message: string='';
    submittable: boolean= false;
    photosMessage:string="";
    newProduct: boolean=false;
    continueNextStep: boolean= true;
    isDirty: boolean= false;

    
    constructor(private changeDetectionRef: ChangeDetectorRef, 
        private apollo: Apollo, private elementRef:ElementRef,
        private buds: BulkUploadDataService) {

    }
    canDeactivate(): boolean {
        return this.isDirty == false;
    }
    setPage(event:number){
        this.currentPage= event;
    }
    //[disabled]="!(['UpdateCatalog', 'UpdateProduct'] | hasPermission)"

    async parseExcelFile(event:any){
        let rows:Row[];
        try{
            rows= await readXlsxFile(event.target.files[0]);
        }catch(err){
            this.showFileError(`Unable to parse file. Please make sure it is an excel file.`);
            return;
        }
        this.isDirty= true;
        if(this.checkColumnHeads(rows[0])){
            if(rows.length < 2){
                this.showFileError(`At least two rows are expected`);
            }
            if(rows.length>101){
                this.showFileError(`Can't upload more than 100 products and variants`);
            }
            else{
                this.createPossibleProducts(rows.slice(1));
            }
        }
    }

    createPossibleProducts(dataRows:Row[]){
        this.submittable= true;
        this.itemsList=[];
        this.changeDetectionRef.detectChanges();
        for(var rowIndex in dataRows){
            var row= dataRows[rowIndex];
            var newPossibleProduct= new PossibleProduct();
            for(var columnIndex in this.excelColumns){
                var columnName= this.excelColumns[columnIndex];
                newPossibleProduct[columnName]= row[columnIndex];
            }
            newPossibleProduct.slug= newPossibleProduct[this.excelColumns[0]].toString().trim().toLowerCase().replaceAll(' ','-')
            +'-'+Math.random().toString(36).slice(2, 4);
            if(newPossibleProduct[this.excelColumns[this.excelColumns.length-2]] === null){
                newPossibleProduct.status= UploadStatus.READY;
            }
            else{ 
                if(this.images && this.updateProductAsset(newPossibleProduct)){
                    newPossibleProduct.status= UploadStatus.READY;
                }else{
                    this.submittable= false;
                    newPossibleProduct.status= UploadStatus.INCOMPLETE;
                }
            }
            this.itemsList.push(newPossibleProduct);
        }
        this.changeDetectionRef.detectChanges();
        if(this.images){
            let imgTags= this.elementRef.nativeElement.querySelectorAll('.img-cell');
            setTimeout(()=>{
                let thoseItemsWhoAreProducsts= this.itemsList.filter((item)=>item[this.excelColumns[7]]!=null && (item[this.excelColumns[7]]).toString().trim() != '');
                for(let index in thoseItemsWhoAreProducsts){
                    if(imgTags[index]){
                        imgTags[index].src= thoseItemsWhoAreProducsts[index].img;
                    }
                }
                this.changeDetectionRef.detectChanges();
            },200);
        }
    }

    handleOptionsIssues(cell:any, index:string, possibleProduct:PossibleProduct):boolean{
        var trimmed= cell.toString().trim();
        var optionsGroupsIndex='5';
        var list:string[]=[];
        if(index===optionsGroupsIndex){
            var splitted= trimmed.split(',');
            for(var value of splitted){
                value= value.toString().trim();
                if(value !== ''){
                    list.push(value)
                }
            }
            possibleProduct[this.excelColumns[index]]= list;
            return true;
        }else {
            var splitted= trimmed.split(',');
            for(var value of splitted){
                value= value.toString().trim();
                if(value !== ''){
                    list.push(value)
                }
            }
            if( possibleProduct[this.excelColumns[optionsGroupsIndex]].length !== list.length){
                return false;
            }
            possibleProduct[this.excelColumns[index]]= list;
            return true;
        }
        //return true;
    }



    checkCell(cell:any, columnIndex:string):boolean{
        if(cell!= null){
            var trimmed= cell.toString().trim();
            if(trimmed !== ''){
                if(columnIndex === '3'){
                    var price:number= parseFloat(trimmed);
                    return !Number.isNaN(price) && price >0;
                }
                if(columnIndex === '4'){
                    var stock:number= Number(trimmed);
                    return Number.isInteger(stock) && stock>0;
                }
                return true;
            }
        }
        return false;
    }

    checkColumnHeads(titleRow:Row){
        for(var index in titleRow){
                if( titleRow[index].toString() !== this.excelColumns[index]){
                    this.showFileError(`Unidentified or misplaced column '${titleRow[index]}'. 
                    Please make sure the document contains only  'Name','Description', 'SKU',
                    'Price','Stock' and 'Featured Asset' columns in this exact order.`);
                    return false;
                }
        }
        return true;
    }

    showFileError(error:string){
        this.message=error;
        this.showMessage=true;
        this.changeDetectionRef.detectChanges();
        this.excelFile= null;
    }

    parseImages(event:any){
        this.images= event.target.files;
        if(this.images && this.images.length>100){
            this.showFileError(`Can't upload more than 100 assets at a time`);
            this.submittable= false;
            event.target.value=null;
            return;
        }
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png','image/jpg','image/webp'];
        for(let uploadedFile of event.target.files){
            if(!validImageTypes.includes(uploadedFile['type'])){
                this.submittable= false;
                this.images= null;
                this.elementRef.nativeElement.querySelector('#filePicker').value=null;
                this.showFileError(`${uploadedFile.name} is not an image file`);
                return;
            }
            if(uploadedFile.size > 5000000){
                this.submittable= false;
                this.images= null;
                this.elementRef.nativeElement.querySelector('#filePicker').value=null;
                this.showFileError(`${uploadedFile.name} have exceeded the 5MB file size limit`);
                return;
            }
        }
        if(this.itemsList.length >0 && this.images != null){
            this.submittable= true;
            this.isDirty= true;
            let imgTags= this.elementRef.nativeElement.querySelectorAll('.img-cell');
            let imgTagIndex:number=0;
            for(var possibleProductIndex in this.itemsList){
                let possibleProduct= this.itemsList[possibleProductIndex];
                if(possibleProduct[this.excelColumns[this.excelColumns.length-2]] === null){
                    possibleProduct.status= UploadStatus.READY;
                }
                else {
                    this.submittable= this.updateProductAsset(possibleProduct, imgTags[imgTagIndex]);
                    imgTagIndex+=1;
                }
            }
            if(this.submittable && this.itemsList.length < this.images.length){
                this.photosMessage=`*Some of the uploaded images couldn't 
                be found in the uploaded products excel file`;
            }else{
                this.photosMessage='';
            }
        }else{
            if(this.images == null){
                this.photosMessage="*No images have been selected";
            }
        }
        this.changeDetectionRef.detectChanges();
    }

    updateProductAsset(possibleProduct:PossibleProduct, imgElement: any | undefined=undefined):boolean{
        if(imgElement){
            imgElement.src='';
        }
        for(var imageFile of this.images!){
            if(imageFile.name === possibleProduct[this.excelColumns[this.excelColumns.length-2]].toString().trim()){
                var reader = new FileReader();
                possibleProduct.imageFile= imageFile;
                reader.onload= (e)=>{
                    if(imgElement){
                        imgElement.src=reader.result;
                        this.changeDetectionRef.detectChanges()
                    }else{
                        possibleProduct.img=reader.result;
                    }
                };
                reader.readAsDataURL(imageFile);
                return true;
            }
        }
        return false;
    }

    setItemsPerPage(event:number){
        this.itemsPerPage= event;
    }

    async getUploadFormat(event:any){
        var value:any[][]= [];
        var headerRow:any[]=[];
        for(var e of this.excelColumns){
            headerRow.push({value: e});
        }
        value.push(headerRow);
        await writeXlsxFile(value, {
            fileName: 'products.xlsx'
          });
    }

    reformatData(){
        let createAbleProducts:ActualProduct[]=[];
        let currentProduct:any={};
        let currentProductVariants:ActualProductVariant[]=[];
        let success:boolean= true;
        let skusSoFar:string[]=[]
        for(let itemIndex in this.itemsList){
            let item= this.itemsList[itemIndex];
            let flag= item[this.excelColumns[this.excelColumns.length-1]].toString().toLowerCase();
            if(flag === 'true'){
                if(itemIndex !== '0'){
                    currentProduct.variants=[...currentProductVariants];
                    createAbleProducts.push(currentProduct);
                    currentProductVariants=[];
                }
                if(!this.checkProductDataForErrors(item, itemIndex)){
                    success= false;
                    break;
                }
                currentProduct= {};
                currentProduct.name= item[this.excelColumns[0]].toString().trim();
                currentProduct.slug= item.slug;
                currentProduct.description= item[this.excelColumns[1]].toString().trim();
                currentProduct.featuredAsset= {file: item.imageFile};
                let candidateOptionGroups= item[this.excelColumns[5]].split(',').filter((item)=> item.toString().trim() !== '').map((item)=> item.toLowerCase()); 
                if(new Set(candidateOptionGroups).size !== candidateOptionGroups.length){
                    this.showFileError(`Product in row ${parseInt(itemIndex)+2} under column 
                    ${this.excelColumns[5]} contains duplicate option groups`);
                    success= false;
                    break;
                }
                currentProduct.options= candidateOptionGroups;
            }else if(flag === 'false'){
                if(!this.checkProductVariantDataForErrors(item, itemIndex)){
                    success= false;
                    break;
                }
                let newVariant:any={};
                newVariant.name= item[this.excelColumns[0]].toString().trim();
                // console.log(item, parseInt(itemIndex)+2)
                let candidateSKU= item[this.excelColumns[2]].toString().trim();
                for(let approvedSKU of skusSoFar){
                    if(approvedSKU == candidateSKU){
                        this.showFileError(`
                            sku value '${candidateSKU}' in variant of row ${parseInt(itemIndex)+2} 
                            for product '${currentProduct.name}' already exists in this excel  
                        `);
                        success= false;
                        break
                    }
                }
                skusSoFar.push(candidateSKU);
                newVariant.sku= candidateSKU;
                newVariant.price= item[this.excelColumns[3]];
                newVariant.description= item[this.excelColumns[1]].trim();
                newVariant.featuredAsset= {file: item.imageFile};
                newVariant.stockOnHand= item[this.excelColumns[4]];
                let candidateVariants= item[this.excelColumns[6]].split(',').filter((item)=> item.toString().trim() !== '');
                if(currentProduct.options.length !== 
                    candidateVariants.length){
                        this.showFileError(`
                            Variant in row ${parseInt(itemIndex)+2} and its parent product have different amount of option groups.
                        `)
                        success= false;
                        break
                }
                if(currentProductVariants.length>0 && currentProductVariants[currentProductVariants.length-1].values.length !== 
                    candidateVariants.length){
                        this.showFileError(`
                            Variant in row ${parseInt(itemIndex)+1} and row ${parseInt(itemIndex)+2} have different amount of option values.
                        `)
                        success= false;
                        break
                }
                if(currentProductVariants.length>0){
                    for(let acceptedVariantIndex in currentProductVariants){
                        let acceptedVariantValues= currentProductVariants[acceptedVariantIndex].values;
                        for(let previousIndex in candidateVariants){
                            if(acceptedVariantValues[previousIndex].toLowerCase() === 
                                candidateVariants[previousIndex].toLowerCase()){
                                    this.showFileError(`
                                        Variants for product '${currentProduct.name}' in row ${parseInt(itemIndex)+2} and 
                                        row ${parseInt(itemIndex)+2-(currentProductVariants.length-parseInt(acceptedVariantIndex))}, 
                                        under ${this.excelColumns[6]} column,
                                        have common option values for the same option group.
                                    `)
                                    success= false;
                                    break
                            }
                        }
                    }
                }
                if(!success){
                    break
                }
                newVariant.values= candidateVariants;
                currentProductVariants.push(newVariant)
            }else{
                this.showFileError(`
                    Unidentified value ${flag} under column 
                    ${this.excelColumns[this.excelColumns.length-1]} 
                    row ${parseInt(itemIndex)+2}. Please insert only TRUE or FALSE`)
                    success= false;
                    break
            }
        }
        currentProduct.variants=[...currentProductVariants];
        createAbleProducts.push(currentProduct);
        if(!success){
            this.submittable= false;
        }else{
            if(success){
                this.submittable= false;
                this.buds.uploadContent(createAbleProducts).then((reply)=> this.isDirty= false);
            }
        }
    }

    checkProductDataForErrors(item:PossibleProduct, row:string):boolean{
        let productEssentialIndexes:number[]= [0,1,5];
        for(let essential of productEssentialIndexes){
            if(item[this.excelColumns[essential]]===null || 
               item[this.excelColumns[essential]].toString().trim() === '' ){
                this.showFileError(`
                    Unidentified or empty value under column 
                    ${this.excelColumns[essential]} 
                    row ${row+1}.`)
                return false;
            }
        }
        return true;
    }

    checkProductVariantDataForErrors(item:PossibleProduct, row:string):boolean{
        let productEssentialIndexes:number[]= [0,1,2,3,4,6];
        for(let essential of productEssentialIndexes){
            if(item[this.excelColumns[essential]]==null || 
                 item[this.excelColumns[essential]].toString().trim() === '' ){
                this.showFileError(`
                    Unidentified or empty value under column 
                    ${this.excelColumns[essential]} 
                    row ${row+1}.`)
                return false;
            }else{
                // if(item[this.excelColumns[essential]] instanceof String){
                let trimmed=item[this.excelColumns[essential]].toString().trim();
                if(essential === 3){
                    var price:number= parseFloat(trimmed);
                    if(Number.isNaN(price) || price < 0){
                        this.showFileError(`
                            Unidentified or empty value under column 
                            ${this.excelColumns[essential]} 
                            row ${parseInt(row)+1}.`)
                        return false;
                    }
                }
                if(essential === 4){
                    var stock:number= Number(trimmed);
                    if( !Number.isInteger(stock) || stock<0){
                        this.showFileError(`
                            Unidentified or empty value under column 
                            ${this.excelColumns[essential]} 
                            row ${parseInt(row)+1}.`)
                        return false;
                    }
                }
                // }
            }
        }
        return true;
    }

    // createProductInfo(possibleProduct:PossibleProduct)
}