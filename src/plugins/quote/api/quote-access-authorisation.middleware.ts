
import { Administrator } from '@etech/core';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getCurrentUser } from '../../addons/api/get-current-user';
import {getRepository} from 'typeorm';
import { Quote } from './quote_entity';
@Injectable()
export class QuoteAccessAuthorizationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const currentUser= await getCurrentUser(req, 'bearer');
    if(currentUser){
      if(currentUser instanceof Administrator){
        next();
      }else{
        if(req.originalUrl){
          const url= req.originalUrl.split('?')[0];
          const quoteRepo= getRepository(Quote);
          if(await quoteRepo.count({where:{assetUrl:url,userEmail:currentUser.emailAddress}})){
            next();
          }
        }
      }
    }
  }
}
