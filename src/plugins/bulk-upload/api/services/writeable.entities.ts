import { ID } from "@etech/core";
import { ActualProduct, ActualProductVariant, CreateAssetInput } from "../../ui/generated-admin-types";

export class WriteableProduct{
    optionGroupIds:number[]=[]
    assetId: ID
    productId: ID
    name:string
    slug:string
    description:string
    featuredAsset:CreateAssetInput
    options:string[]=[]
    variants:WriteableProductVariant[]=[]

    constructor(private fromGql: ActualProduct){
        this.description=fromGql.description;
        this.featuredAsset=fromGql.featuredAsset;
        this.name=fromGql.name;
        this.options=fromGql.options;
        this.slug=fromGql.slug;
        this.variants=fromGql.variants.map((a)=> new WriteableProductVariant(a));
    }
}

export class WriteableProductVariant{
    name:string
    sku:string
    assetId: ID
    price:number
    description:string
    stockOnHand:number
    values:string[]
    featuredAsset:CreateAssetInput
    assignedOptionIds:number[]=[]

    constructor(private fromGql: ActualProductVariant){
        this.description=fromGql.description;
        this.featuredAsset=fromGql.featuredAsset;
        this.name=fromGql.name;
        this.price=fromGql.price;
        this.sku=fromGql.sku;
        this.stockOnHand=fromGql.stockOnHand;
        this.values=fromGql.values;
    }
}