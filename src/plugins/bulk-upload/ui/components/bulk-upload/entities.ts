import { ID } from "@etech/core"

export class PossibleProduct{
    optionGroupIds:number[]=[]
    assignedOptionIds:number[]=[]
    slug:string
    img:string | ArrayBuffer | null
    assetId:string
    productId:string
    imageFile: File;
    status:UploadStatus;
}
export class WriteableProduct{
    optionGroupIds:number[]=[]
    assetId: ID;
    productId: ID;
    name:string;
    slug:string;
    description:string;
    featuredAsset:Blob;
    options:string[]=[];
    variants:WriteableProductVariant[]=[];
}

export class WriteableProductVariant{
    name:string;
    sku:string;
    assetId: ID;
    price:number;
    description:string;
    stockOnHand:string;
    values:string[];
    featuredAsset:Blob;
    assignedOptionIds:number[]=[]
}

export class OptionValue{
    option:string;
    value:string;
}
export enum UploadStatus{
    INCOMPLETE, ASSET_SIZE_LIMIT_EXCEEDED, READY, ASSET_CREATED, PRODUCT_CREATED, VARIANT_ADDED, DONE, DUPLICATE_SKU, FAIL
}