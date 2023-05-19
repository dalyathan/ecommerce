import { CustomerGroupService, EventBus, ID, ProductVariantService, RequestContext, TransactionalConnection } from '@etech/core';
import {Injectable} from '@nestjs/common';
import { PriceListEvent } from '../events';
import { EditPriceListInput, PriceListDisplay, PriceListInput } from '../ui/generated-admin-types';
// import { PriceListDisplay, PriceListInput } from './api.types';
import PriceList from './price-list.entity';
@Injectable()
export class PriceListService{
    constructor(
        private eventBus: EventBus,
        private transactionConnection: TransactionalConnection,
        private  productVariantServie: ProductVariantService, 
        private customerGroupService:CustomerGroupService){
    }

    async createPriceList(ctx: RequestContext, createPriceListInput: PriceListInput):Promise<PriceListDisplay>{
        let newPriceList= new PriceList();
        newPriceList.title= createPriceListInput.title;
        newPriceList.customerGroup= await this.customerGroupService.findOne(ctx, createPriceListInput.customerGroupId);
        newPriceList.productVariants= await this.productVariantServie.findByIds(ctx, createPriceListInput.productVariantIds);
        newPriceList.percentDiscount= createPriceListInput.percentDiscount;
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let saved= await priceListRepository.save(newPriceList);
        let returned= { id: saved.id, productVariantIds: saved.productVariants.map((item)=> item.id), title: saved.title, 
            percentDiscount: saved.percentDiscount, customergroup: saved.customerGroup, enabled: saved.enabled} as unknown as  PriceListDisplay;
        this.eventBus.publish(new PriceListEvent(ctx, saved, 'created', createPriceListInput))
        return returned;
    }

    async createStoreWideDiscount(ctx: RequestContext, createPriceListInput: PriceListInput):Promise<PriceListDisplay>{
        let newPriceList= new PriceList();
        newPriceList.isPriceListStoreWide= true;
        newPriceList.productVariants= await this.productVariantServie.findByIds(ctx, createPriceListInput.productVariantIds);
        newPriceList.title= createPriceListInput.title;
        newPriceList.percentDiscount= createPriceListInput.percentDiscount;
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let saved= await priceListRepository.save(newPriceList);
        let returned= { id: saved.id, title: saved.title, productVariantIds: saved.productVariants.map((item)=> item.id),
            percentDiscount: saved.percentDiscount, enabled: saved.enabled} as unknown as  PriceListDisplay;
        this.eventBus.publish(new PriceListEvent(ctx, saved, 'created', createPriceListInput))
        return returned;
    }

    async editStoreWideDiscount(ctx: RequestContext, editPriceListInput: EditPriceListInput):Promise<PriceListDisplay>{
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let existing= await priceListRepository.findOne(editPriceListInput.priceListId);
        existing.percentDiscount= editPriceListInput.percentDiscount;
        existing.productVariants= await this.productVariantServie.findByIds(ctx, editPriceListInput.productVariantIds);
        existing.title= editPriceListInput.title;
        let updatedReply= await priceListRepository.save([existing]);
        this.eventBus.publish(new PriceListEvent(ctx, updatedReply[0], 'updated', editPriceListInput))
        return {id: updatedReply[0].id,title: updatedReply[0].title,  productVariantIds: updatedReply[0].productVariants.map((item)=> item.id),
            percentDiscount: updatedReply[0].percentDiscount, enabled: updatedReply[0].enabled}as unknown as  PriceListDisplay;
    }

    async editPriceList(ctx: RequestContext, editPriceListInput: EditPriceListInput):Promise<PriceListDisplay>{
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let existing= await priceListRepository.findOne(editPriceListInput.priceListId);
        existing.customerGroup= await this.customerGroupService.findOne(ctx, editPriceListInput.customerGroupId);
        existing.percentDiscount= editPriceListInput.percentDiscount;
        existing.productVariants= await this.productVariantServie.findByIds(ctx, editPriceListInput.productVariantIds);
        existing.title= editPriceListInput.title;
        let updatedReply= await priceListRepository.save([existing]);
        this.eventBus.publish(new PriceListEvent(ctx, updatedReply[0], 'updated', editPriceListInput))
        return {id: updatedReply[0].id, productVariantIds: updatedReply[0].productVariants.map((item)=> item.id),title: updatedReply[0].title, 
            percentDiscount: updatedReply[0].percentDiscount, customergroup: updatedReply[0].customerGroup, enabled: updatedReply[0].enabled}as unknown as  PriceListDisplay;
    }

    async priceLists(ctx: RequestContext):Promise<PriceListDisplay[]>{
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let priceListFromDb= await priceListRepository
        .createQueryBuilder('priceList')
        .leftJoinAndSelect('priceList.productVariants','productVariant')
        .leftJoinAndSelect('priceList.customerGroup','customerGroup')
        .getMany();
        // console.log(priceListFromDb);
        return priceListFromDb.map(
            (existing)=> 
            ({id: existing.id, productVariantIds: existing.productVariants.map((item)=> item.id),title: existing.title, 
                isPriceListStoreWide: existing.isPriceListStoreWide,
                percentDiscount: existing.percentDiscount, customergroup: existing.customerGroup, enabled: existing.enabled} as unknown as  PriceListDisplay));
    }

    async togglePriceList(ctx: RequestContext, priceListId: ID): Promise<PriceListDisplay>{
        let priceList= await this.transactionConnection.getRepository(ctx, PriceList)
        .createQueryBuilder('priceList')
        .leftJoinAndSelect('priceList.productVariants','productVariant')
        .leftJoinAndSelect('priceList.customerGroup','customerGroup')
        .where(`priceList.id=${priceListId}`)
        .getOne();
        priceList.enabled= priceList.enabled ? false: true;
        let priceListRepository= this.transactionConnection.getRepository(ctx, PriceList);
        let updateReply= await priceListRepository.save(priceList);
        this.eventBus.publish(new PriceListEvent(ctx, updateReply, 'updated', priceListId))
        return {id: updateReply.id, productVariantIds: updateReply.productVariants.map((item)=> item.id),title: updateReply.title, 
            percentDiscount: updateReply.percentDiscount, customergroup: updateReply.customerGroup, enabled: updateReply.enabled}as unknown as  PriceListDisplay;
    }
}
