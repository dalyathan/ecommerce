import { ChangeDetectionStrategy, Component, OnChanges, OnInit, ChangeDetectorRef} from '@angular/core';
import { GlobalFlag } from '@etech/common/lib/generated-types';
import { Asset } from '@etech/core';
import { Apollo, gql } from 'apollo-angular';
import { BulkUploadComponent } from './bulk-upload.component';
import {WriteableProduct, PossibleProduct, UploadStatus} from './entities';
export class UpdatedCreationHelper{
    
    continueNextStep:boolean= true;
    constructor(
        private itemsList: WriteableProduct[], private apollo:Apollo, private changeDetectionRef: ChangeDetectorRef, 
        private skusSoFar:string[], private componentPointer: BulkUploadComponent, 
        private currentPage: number, private itemsPerPage: number){

    }

    async  createAssets(){
        var assets:any[]=[];
        this.itemsList.forEach((a)=> {
            assets.push({file: a.featuredAsset});
            a.variants.forEach((v)=>{
                assets.push({file: v.featuredAsset});
            })
        });
        var createAssetMutation=gql`
        mutation UploadMutation(
            $assets: [CreateAssetInput!]!
          ) {
            createAssets(input: $assets) {
                ...on Asset{
                    id
                  }
                ...on MimeTypeError{
                    message
                }
            }
          }
          `;
        this.continueNextStep= true;
        try{
        var reply= await this.apollo.mutate<any>({
            mutation: createAssetMutation,
            variables: {
                assets: assets
            },
            context: {
               useMultipart: true
            }
          }).toPromise();
        //   console.log(reply.data.createAssets);
          let iterableArray= (reply.data.createAssets as Asset[]);
          let counter=0;
          for(var possibleProduct of this.itemsList){
            //   var possibleProduct= this.itemsList[possibleProductIndex];
            let mutationResult= iterableArray[counter];
            var assetId= mutationResult.id;
            if(assetId && assetId!==null){
                possibleProduct.assetId= assetId;
            }else{
                this.continueNextStep= false;
                this.componentPointer.showFileError('Unable to create asset');
            }
            for(var variant of possibleProduct.variants){
                let mutationResult= iterableArray[counter];
                var assetId= mutationResult.id;
                if(assetId && assetId!==null){
                    variant.assetId= assetId;
                    counter+=1;
                }else{
                    this.continueNextStep= false;
                    this.componentPointer.showFileError('Unable to create asset');
                }
            }
            //to conserve memory and to not also intimidate the user photos in the current page are not removed
            // if(parseInt(possibleProductIndex)+1 < (this.currentPage-1)*this.itemsPerPage || 
            //    parseInt(possibleProductIndex)+1 > this.currentPage*this.itemsPerPage){
            //     // possibleProduct.img='';
            // }
          }
        }catch(err){
            this.continueNextStep= false;
            this.componentPointer.showFileError('Unable to create asset');
            // this.setStatusForAll(UploadStatus.FAIL);
        };
        this.changeDetectionRef.detectChanges();
    }

    // setStatusForAll(status:UploadStatus){
    //     for(var possibleProduct of this.itemsList){
    //         possibleProduct.status= status;
    //     }
    // }

    async createProducts(){
        this.continueNextStep= true;
        for(var possibleProduct of this.itemsList){
            try{
                var productEnglishTranslationInput={
                    languageCode: 'en',
                    name: possibleProduct.name,
                    slug: possibleProduct.slug,
                    description: possibleProduct.description,
                };
                var createProductInput= {
                    featuredAssetId: possibleProduct.assetId,
                    enabled: true,
                    translations: [productEnglishTranslationInput]
                }
                var mutation=gql`
                mutation CreateProductMutation(
                    $createProductInput: CreateProductInput!
                  ) {
                    createProduct(input: $createProductInput){
                        id
                    }
                  }
                `;
                var reply= await this.apollo.mutate<any>({
                    mutation: mutation,
                    variables: {
                        createProductInput: createProductInput
                    },
                }).toPromise();
                var productId= reply.data.createProduct.id;
                if(productId && productId!==null){
                    possibleProduct.productId= productId;
                    // possibleProduct.status= UploadStatus.PRODUCT_CREATED;
                }else{
                    this.continueNextStep= false;
                    this.componentPointer.showFileError('Unable to create product');
                    // possibleProduct.status= UploadStatus.FAIL;
                }
            }catch(err){
                this.continueNextStep= false;
                this.componentPointer.showFileError('Unable to create product');
                // possibleProduct.status= UploadStatus.FAIL;
            };
        }
        this.changeDetectionRef.detectChanges();
    }

    async createProductOptionGroups(){
        this.continueNextStep= true;
        for(var possibleProduct of this.itemsList){
            var optionGroups=  possibleProduct.options;// as String).split(',');
            // var optionValues= possibleProduct[this.excelColumns[this.excelColumns.length-2]];//as String).split(',');
            for(var optionGroupIndex in optionGroups){
                var createProductOptionGroupsInput={
                    code: optionGroups[optionGroupIndex],
                    translations: [
                        {
                            languageCode: 'en',
                            name: optionGroups[optionGroupIndex],
                        }
                    ],
                    options: possibleProduct.variants.map((variant)=>{
                        let optionValues= variant.values;
                            return {
                                code: optionValues[optionGroupIndex],
                                translations: [
                                    {
                                        languageCode: 'en',
                                        name: optionValues[optionGroupIndex],
                                    }
                                ]
                            }
                        }
                    )
                }
                var mutation=`
                    mutation CreateProductOptionGroupMutation(
                        $createProductOptionGroupsInput: CreateProductOptionGroupInput!
                    ){
                        createProductOptionGroup(input: $createProductOptionGroupsInput){
                            id
                            options{
                                id
                            }
                        }
                    }
                `;
                // console.log(createProductOptionGroupsInput.options)
                if(createProductOptionGroupsInput.options.length > 0){
                    try{
                        var reply= await this.apollo.mutate<any>({
                            mutation: gql(mutation),
                            variables: {
                                createProductOptionGroupsInput: createProductOptionGroupsInput
                            },
                        }).toPromise();
                        if(reply.data.createProductOptionGroup.id && 
                            reply.data.createProductOptionGroup.options[0] && 
                            reply.data.createProductOptionGroup.options[0].id){
                                possibleProduct.optionGroupIds.push(parseInt(reply.data.createProductOptionGroup.id));
                                for(let variantIndex in possibleProduct.variants){
                                    possibleProduct.variants[variantIndex]
                                        .assignedOptionIds
                                        .push(parseInt(reply.data.createProductOptionGroup.options[variantIndex].id));
                                }
                        }else{
                            // console.log(createProductOptionGroupsInput.options,reply.data)
                            this.continueNextStep= false;
                            this.componentPointer.showFileError('Unable to create product options');
                            // possibleProduct.status= UploadStatus.FAIL;
                        }
                    }catch(err){
                        this.continueNextStep= false;
                        // console.log(err)
                        this.componentPointer.showFileError('Unable to create product options');
                        // possibleProduct.status= UploadStatus.FAIL;
                    }
                }
            }
        }
        this.changeDetectionRef.detectChanges();
    }

    async addOptionGroupsToProducts(){
        this.continueNextStep= true;
        for(var possibleProduct of this.itemsList){
            for(var optionGroupId of possibleProduct.optionGroupIds){
                var mutation=gql`
                mutation AddOptionGroupToProduct{
                    addOptionGroupToProduct(productId: ${possibleProduct.productId}, optionGroupId: ${optionGroupId}){
                        id
                    }
                }
                `;
                try{
                    var reply= await this.apollo.mutate<any>({
                        mutation: mutation,
                    }).toPromise();
                    if(possibleProduct.productId !== reply.data.addOptionGroupToProduct.id){
                        this.continueNextStep= false;
                        this.componentPointer.showFileError('Unable to add options to products');
                        // possibleProduct.status= UploadStatus.FAIL;
                    }
                }catch(err){
                    this.continueNextStep= false;
                    this.componentPointer.showFileError('Unable to add options to products');
                    // possibleProduct.status= UploadStatus.FAIL;
                }
            }
        }
    }

    async createProductVariants(){
        this.continueNextStep= true;
        for(var possibleProduct of this.itemsList){
            let createProductVariantInput:any[]=[];
            for(let variant of possibleProduct.variants){
                var input={
                    productId: possibleProduct.productId,
                    sku: variant.sku,
                    price: parseInt(variant.price.toFixed(2).replace('.','')),
                    stockOnHand: parseInt(variant.stockOnHand),
                    optionIds: variant.assignedOptionIds,
                    featuredAssetId: variant.assetId,
                    trackInventory: GlobalFlag.TRUE,
                    customFields: {
                        description: variant.description
                    },
                    translations: [
                        {
                            languageCode: 'en',
                            name: variant.name + ' '+variant.values.join(' '),
                        }
                    ],
                };
                createProductVariantInput.push(input);
            }
            if(createProductVariantInput.length > 0){
                var createProductVariantMutation=gql`
                mutation CreateProductVariantsMutation(
                    $createProductVariantsInput: [CreateProductVariantInput!]!
                ){
                    createProductVariants(input: $createProductVariantsInput){
                    id
                    }
                }`;
                try{
                    var reply= await this.apollo.mutate<any>({
                        mutation: createProductVariantMutation,
                        variables: {
                            createProductVariantsInput: createProductVariantInput
                        },
                    }).toPromise();
                    if (reply.data.createProductVariants[0] && reply.data.createProductVariants[0].id){
                        // possibleProduct.status= UploadStatus.DONE;
                    }else{
                        this.continueNextStep= false;
                        this.componentPointer.showFileError('Unable to create product variants');
                        // possibleProduct.status= UploadStatus.FAIL;
                    }
                }catch(err){
                    this.continueNextStep= false;
                    this.componentPointer.showFileError('Unable to create product variants');
                    // possibleProduct.status= UploadStatus.FAIL;
                };
            }
        }
        this.changeDetectionRef.detectChanges();
    }

    async checkSkuUniqueness(){
        this.continueNextStep= true;
        let query=`
            query CheckSKUs{
                checkSKUs(values: [${this.skusSoFar.map(item=>`"${item}"`)}])
            }
        `;
        let reply:any= await this.apollo.query({query: gql(query)}).toPromise();
        let allIsWell= true;
        for(let skuIndex in this.skusSoFar){
            let possibleSku= this.skusSoFar[skuIndex];
            if(!reply.data.checkSKUs[skuIndex]){
                this.componentPointer.showFileError(`SKU ${possibleSku} already exists`);
                // possibleSkus.status= UploadStatus.DUPLICATE_SKU;
                // console.log('amen amen')
                allIsWell= false;
                break;
            }
        }
        this.continueNextStep= allIsWell;
        this.changeDetectionRef.detectChanges();
    }

    

    async submitProducts(){
        if(this.continueNextStep){
            await this.checkSkuUniqueness();
        }
        if(this.continueNextStep){
            await this.createAssets();
        }
        if(this.continueNextStep){
            await this.createProducts();
        }
        if(this.continueNextStep){
            await this.createProductOptionGroups();
        }
        if(this.continueNextStep){
            await this.addOptionGroupsToProducts();
        }
        if(this.continueNextStep){
            await this.createProductVariants();
        }
        if(this.continueNextStep){
            this.componentPointer.showFileError(`Success !!! ${this.itemsList.length} products with variants created`);
        }
    }
}