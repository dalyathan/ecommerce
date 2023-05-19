import { Product, RequestContext } from "@etech/core";
import { EtechEntityEvent } from "@etech/core/dist/event-bus/etech-entity-event";
import { ProductBrand } from "./api/entities/brand-entity";
import { ProductIndustry } from "./api/entities/industry-entity";
import { BrandInputType, IndustryInputType } from "./generated-admin-types";

export class ProductIndustryEvent extends EtechEntityEvent<ProductIndustry, IndustryInputType> {
    constructor(
        ctx: RequestContext,
        entity: ProductIndustry,
        type: 'created' | 'updated' | 'deleted',
        input?: IndustryInputType,
        entityBeforeUpdate?: ProductIndustry,
    ) {
        super(entity, type, ctx, input,entityBeforeUpdate);
    }
    get product(): ProductIndustry {
        return this.entity;
    }
}

export class ProductBrandEvent extends EtechEntityEvent<ProductBrand, BrandInputType> {
    constructor(
        ctx: RequestContext,
        entity: ProductBrand,
        type: 'created' | 'updated' | 'deleted',
        input?: BrandInputType,
        entityBeforeUpdate?: ProductBrand,
    ) {
        super(entity, type, ctx, input,entityBeforeUpdate);
    }
    get product(): ProductBrand {
        return this.entity;
    }
}