import { Apollo, gql } from 'apollo-angular';

export class PieData{
    data:number[]=[0,0,0,0,0,0];
    labels:string[]=['AddingItems','ArrangingPayment','PaymentAuthorized','PaymentSettled','Shipped','Delivered'];
    public gqlFormat:string= `{
        orders(options: {filter: {createdAt: {after: "%fromDay"}}}){
            totalItems
            items{
                totalWithTax
                state
            },
        }
      }`;
    public emptyData:boolean= true;
    public gqlString:string;
    public fromDayISOFormat:string;
    constructor(private apollo:Apollo){

    }

    public formatGqltoThisWeek(){
        var today= new Date();
        var monday= new Date();
        monday.setDate(today.getDate()- (today.getDay()-1));
        var mondayStr= monday.toISOString();
        this.fromDayISOFormat= mondayStr.split('T')[0]+"T00:00:00.000Z";
        this.gqlString= this.gqlFormat.replace("%fromDay",this.fromDayISOFormat);
    }

    public formatGqltoThisMonth(){
        var today= new Date();
        var firstDayOfTheMonth= new Date();
        firstDayOfTheMonth.setDate(1);
        var firstDayOfTheMonthStr= firstDayOfTheMonth.toISOString();
        this.fromDayISOFormat= firstDayOfTheMonthStr.split('T')[0]+"T00:00:00.000Z";
        this.gqlString= this.gqlFormat.replace("%fromDay",this.fromDayISOFormat);
    }

    public formatGqltoThisYear(){
        var today= new Date();
        this.fromDayISOFormat= `${today.getFullYear()}-01-01T00:00:00.000Z`;
        this.gqlString= this.gqlFormat.replace("%fromDay", this.fromDayISOFormat);   
    }

    async getStocks(callback:any){
        this.data=[0,0,0,0,0,0];
        this.emptyData= true;
        this.apollo.query<any>({
            query: gql(this.gqlString)
        }).subscribe(({ data, loading })=>{
            if(!loading){
                this.generateLabelAndData(data.orders.items);
                callback();
            }
        });
        // if(reply.error == null && reply.errors == null){
        //     this.generateLabelAndData(reply.data.orders.items);
        // }
        // else{
        //     throw reply.error ?? reply.errors;
        // }
    }

    generateLabelAndData(list:any){
        for(var order of list){
            this.emptyData= false;
            var index= this.labels.indexOf(order['state']);
            this.data[index]+= parseFloat(order['totalWithTax'])/100;
        }
    }
}