// products.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { Ctx, OrderService, ProductService, RequestContext } from '@etech/core'; 
import {
  Req,
  Res,
  Body
} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('telebirr')
export class TelebirrController {
  constructor(private orderSerice: OrderService) {}

  @Post()
 async findAll(@Ctx() ctx: RequestContext, @Req() req: Request,  @Res() res: Response) {

    // if(ctx.req.body.decision === "ACCEPT"){
    //       let order = await this.orderSerice.findOneByCode(ctx,ctx.req.body.req_reference_number);
    // console.log("the order value is ", order);
    // //abyssinia-cybersource-hosted-checkout
    // let updatePaymentMethod = await this.orderSerice.addPaymentToOrder(ctx, order.id, {method:"abyssinia-cybersource-hosted-checkout", metadata: {}});
    // console.log("the updated payment method is ", updatePaymentMethod);
  
    // }
    // else if (ctx.req.body.decision === "CANCEL"){
    //   console.log("sorry the order is canceled")
    // }
    

    return this.orderSerice.findAll(ctx);
  }
}