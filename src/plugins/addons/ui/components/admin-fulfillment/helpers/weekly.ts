import { Order } from '@etech/core';
import { Apollo, gql } from 'apollo-angular';
import {GraphData} from './graph-data';
import { default as dayjs } from 'dayjs';
export class Weekly extends GraphData{

    constructor(private orders: Order[]){
        super();
    }

    generateXAxis(){
        var today= new Date()
        var days=['Monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday','Sunday'];
        this.x_axis= days.slice(0,today.getDay());
        for(var index=0; index<=today.getDay(); index++){
            this.y_axis.push(0);
        }
        var monday= new Date();
        monday.setDate(today.getDate()- (today.getDay()-1));
        var mondayStr= monday.toISOString();
        this.fromDay= monday;
    }

    generateYAxis(){
        for(var order of this.orders){
            var updateDay= dayjs(order.updatedAt);
            if(updateDay>= dayjs(this.fromDay)){
                this.totalOrders+=1;
                var amount:number= order.totalWithTax ? order.totalWithTax/100:0;
                this.totalAmount= amount;
                this.y_axis[updateDay.day()-1]+=/*this.y_axis[creationDay.getDay()-1]+*/amount;
            }
        }
    }
}