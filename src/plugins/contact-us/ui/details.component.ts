import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql, } from 'apollo-angular';
import {take} from 'rxjs/operators';
import { QUERY, SEENQUERY } from "./gql.types";
@Component({
    selector: 'details',
    templateUrl: 'detail.component.html',
    styleUrls: ['./page.component.scss'],
  
  })
  
  export class DetailsComponent {
    goHome(){
     // console.log('http://localhost:3000/admin');
      window.location.href = `${process.env.ECOMMERCE_SERVER_NAME}/admin`
    }
    refresh(){
    

      window.location.reload();
    }
    async inv(id: string){
      await this.apollo.mutate( {mutation:SEENQUERY, variables: {id}  } ).pipe(take(1)).toPromise();
    }
  
    constructor(private route: ActivatedRoute, private apollo: Apollo){}
    public id: string | null = null;
    public quoteData: any = {}
    public show: boolean = false;
   async ngOnInit() {
     
        const  data= await this.route.queryParams.pipe(take(1)).toPromise();
        // (async (data) =>{
          if(data){
            this.id = data.id
            console.log("ID ",this.id)
            const d = this.apollo.query({query: QUERY, variables: {id: this.id}})
            this.quoteData = await (await (d.toPromise())).data as {id: string}
            if(this.quoteData.getContactUsMessage.id) this.show = true;
            this.inv(this.quoteData.getContactUsMessage.id)
          }

        // });
        
    }
 
  }