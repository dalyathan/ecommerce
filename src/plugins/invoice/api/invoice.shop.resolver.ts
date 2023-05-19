import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Allow, Ctx, RequestContext } from '@etech/core';
import { InvoiceService } from './invoice.service';
import { invoicePermission } from '../index';
import {
  Invoice,
  InvoiceList,
  MyInvoicesInput,
} from '../../../ui/generated/graphql';

@Resolver()
export class InvoiceShopApiResolver {
  constructor(private service: InvoiceService) {}

  @Query()
  async myInvoices(
    @Ctx() ctx: RequestContext,
    @Args('input') input?: MyInvoicesInput
  ): Promise<InvoiceList> {
    return this.service.getMyInvoices(ctx,ctx.channel, input);
  }

  @Query()
  async invoice(
    @Ctx() ctx: RequestContext,
    @Args('orderCode') orderCode: string
  ): Promise<Invoice> {
    return this.service.getInvoiceWithCode(ctx,ctx.channel, orderCode);
  }
}
