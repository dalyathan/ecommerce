import {  Injectable } from '@angular/core';
import { Customer, DataService, NotificationService } from '@etech/admin-ui/package/core';
import { ActualProduct } from '../generated-admin-types';
import {gql} from 'graphql-tag';
import {take} from 'rxjs/operators';
@Injectable({
    providedIn: 'any',
  })
export class BulkUploadDataService{
    constructor(private ds: DataService, private ns: NotificationService){

    }

    async uploadContent(createAbleProducts: ActualProduct[]){
      // try{
        const response= await this.ds.mutate<any>(
          gql`
            mutation BulkUploadData($data: [ActualProduct]!){
              uploadBulkData(input: $data)
            }
            `,
        {
          data: createAbleProducts
         }).pipe(take(1)).toPromise();
         this.ns.warning(response.uploadBulkData)
    }
}