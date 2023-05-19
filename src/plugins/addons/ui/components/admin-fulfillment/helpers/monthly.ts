import { Order } from '@etech/core';
import {GraphData} from './graph-data';
import { default as dayjs } from 'dayjs';
export class Monthly extends GraphData{
    endOfWeekDays: number[]=[];
    constructor(private orders: Order[]){
        super();
    }

    
    generateXAxis(){
        var today= new Date();
        var firstDayOfTheMonth= new Date();
        firstDayOfTheMonth.setDate(1);
        this.fromDay=firstDayOfTheMonth;
        var firstDayOfTheMonthStr= firstDayOfTheMonth.toISOString();
        // this.fromDay= firstDayOfTheMonthStr.split('T')[0]+"T00:00:00.000Z";
        var endOfWeek:Date= new Date(firstDayOfTheMonth.valueOf());
        endOfWeek.setDate(7-endOfWeek.getDay()+1);
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var year= today.getFullYear();
        var numOfDaysInEachMonth:number[];
        if((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0)){
            numOfDaysInEachMonth=[31,28,31,30,31,30,31,31,30,31,30,31]
        }else{
            numOfDaysInEachMonth=[31,29,31,30,31,30,31,31,30,31,30,31];
        }
        this.x_axis.push(`${monthNames[firstDayOfTheMonth.getMonth()]} 01 - ${monthNames[endOfWeek.getMonth()]} 0${endOfWeek.getDate()}`);
        this.endOfWeekDays.push(endOfWeek.getDate());
        this.y_axis.push(0);
        while(endOfWeek < today){
            var startOfWeek= new Date(endOfWeek.valueOf());
            startOfWeek.setDate(endOfWeek.getDate()+1);
            if(endOfWeek.getDate()+7 > today.getDate()){
                endOfWeek.setDate(today.getDate());
                // console.log('maybe here')
            }else{
                // console.log('alehu')
                endOfWeek.setDate(endOfWeek.getDate()+7);
            }
            this.x_axis.push(`${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}`); 
            this.endOfWeekDays.push(endOfWeek.getDate());
            this.y_axis.push(0);
        }
        // console.log(this.endOfWeekDays)
    }

    generateYAxis(){
        for(var order of this.orders){
            var updateDay= dayjs(order.updatedAt);//
            // let adjusted=
            if(updateDay>=dayjs(this.fromDay)){
                for(var weekends in this.endOfWeekDays){
                    // console.log(updateDay);
                    if(updateDay.date() <= this.endOfWeekDays[weekends]){
                        this.totalOrders+=1;
                        var amount:number= order.totalWithTax ? order.totalWithTax/100:0;
                        this.totalAmount+=amount;
                        this.y_axis[weekends]+=/*this.y_axis[weekends]+*/amount;
                        break;
                    }
                }
            }
        }
    }
}