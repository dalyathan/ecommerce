import { Apollo, gql } from 'apollo-angular';
export abstract class GraphData{
    public x_axis:string[]=[];
    public y_axis:number[]=[];
    fromDay:Date;
    totalOrders: number=0;
    totalAmount: number=0;

    abstract generateXAxis();
    abstract generateYAxis();
}