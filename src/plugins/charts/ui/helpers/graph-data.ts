import { DateRange } from '@etech/admin-ui/package/core';
import { Apollo, gql } from 'apollo-angular';

export abstract class GraphData{
    public x_axis:string[]=[];
    public xAxisDateRanges:DateRange[]=[];
    public y_axis:number[]=[];
    public query:string;
    fromDay:string;

    constructor(protected apollo: Apollo){

    }

    public set setQuery(_query:string){
        this.query= _query;
    }

    abstract generateXAxis();
    async getStocks(callback:any){
        this.x_axis=[]
        this.y_axis=[]
        this.generateXAxis();
        var query= gql(this.query.replace( "%fromDay", this.fromDay));
        this.apollo.query<any>({
            query: query
        }).subscribe(({ data, loading })=>{
            if(!loading){
                // if(!reply.error){
                    for(var content in data){
                        var middler:string=content;
                        this.generateYAxis(data[`${middler}`].items);
                        callback();
                        break;
                    }
                // }else{
                    // throw reply.error;
                // }
            }
        });
    }
    abstract generateYAxis(list:any);

    moveToLastInstanceInDay(timeInISOFormat:String){
        return timeInISOFormat.split('T')[0] + "T23:59:59.999Z";
    }

    moveToFirstInstanceInDay(timeInISOFormat:String){
        return timeInISOFormat.split('T')[0] + "T00:00:00.001Z";
    }
}