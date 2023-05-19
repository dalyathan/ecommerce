import { Order } from '@etech/core';
import { Apollo, gql } from 'apollo-angular';
import {GraphData} from './graph-data';
import { default as dayjs } from 'dayjs';
export class Yearly extends GraphData{

    constructor(private orders: Order[]){
        super();
    }

    generateXAxis(){
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var today= new Date();
        for(var index=0; index<today.getMonth()+1; index++){
            this.y_axis.push(0);
        }
        this.fromDay= new Date(`${today.getFullYear()}-01-01T00:00:00.000Z`);
        this.x_axis= monthNames.slice(0, today.getMonth()+1);
    }

    generateYAxis(){
        for(var order of this.orders){
            // var updateDay= new Date(order.updatedAt);
            var updateDay= dayjs(order.updatedAt);
            if(updateDay >= dayjs(this.fromDay)){
                this.totalOrders+=1;
                var amount:number= order.totalWithTax ? order.totalWithTax/100:0;
                this.totalAmount+=amount;
                this.y_axis[updateDay.month()]+= /*this.y_axis[creationDay.getMonth()]+*/amount;
            }
        }
    }
}