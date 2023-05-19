import { ID, Product, RequestContext } from "@etech/core";
import { EtechEntityEvent } from "@etech/core/dist/event-bus/etech-entity-event";
import PriceList from "./api/price-list.entity";
import { EditPriceListInput, PriceListInput } from "./ui/generated-admin-types";

export class PriceListEvent extends EtechEntityEvent<PriceList, PriceListInput|EditPriceListInput|ID> {
    constructor(
        ctx: RequestContext,
        entity: PriceList,
        type: 'created' | 'updated' | 'deleted',
        input?: PriceListInput|EditPriceListInput|ID,
        entityBeforeUpdate?: PriceList,
    ) {
        super(entity, type, ctx, input,entityBeforeUpdate);
    }
    get product(): PriceList {
        return this.entity;
    }
}
