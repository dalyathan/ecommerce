import {createWriteStream, ReadStream} from 'fs'
import { RequestContext } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
@Injectable()
export class ProductDocumentationService{
    async uploadDocumentation(ctx: RequestContext, input:any): Promise<String>{
        const { createReadStream, filename } = await input.file;
        const readStream= createReadStream() as ReadStream;
        let filePath= `/assets/documentation/${Math.random().toString(36).slice(2, 7)}_${filename}`;
        const ws = createWriteStream(`./static${filePath}`);
        readStream.pipe(ws);
        return filePath;
    }
}