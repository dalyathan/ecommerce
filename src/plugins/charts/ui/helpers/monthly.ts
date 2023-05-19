import { Apollo, gql } from 'apollo-angular';
import {GraphData} from './graph-data';


export class Monthly extends GraphData{
    endOfWeekDays: number[]=[];
    constructor(protected apollo: Apollo){
        super(apollo);
    }

    
    generateXAxis(){
        var today= new Date();
        var firstDayOfTheMonth= new Date();
        firstDayOfTheMonth.setDate(1);
        var firstDayOfTheMonthStr= firstDayOfTheMonth.toISOString();
        this.fromDay= firstDayOfTheMonthStr.split('T')[0]+"T00:00:00.000Z";
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
        this.xAxisDateRanges.push(
            {
                start: this.moveToFirstInstanceInDay(firstDayOfTheMonthStr), 
                end: this.moveToLastInstanceInDay(endOfWeek.toISOString())
            }
        )
        this.y_axis.push(0);
        while(endOfWeek < today){
            var startOfWeek= new Date(endOfWeek.valueOf());
            startOfWeek.setDate(endOfWeek.getDate()+1);
            if(endOfWeek.getDate()+7 > today.getDate()){
                endOfWeek.setDate(today.getDate());
            }else{
                endOfWeek.setDate(endOfWeek.getDate()+7);
            }
            this.x_axis.push(`${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}`); 
            this.endOfWeekDays.push(endOfWeek.getDate());
            // this.xAxisDateRanges=[{
            //     start: this.moveToFirstInstanceInDay(startOfWeek.toISOString()), 
            //     end: this.moveToLastInstanceInDay(endOfWeek.toISOString())
            // },...this.xAxisDateRanges];
            this.xAxisDateRanges.push(
                {
                         start: this.moveToFirstInstanceInDay(startOfWeek.toISOString()), 
                        end: this.moveToLastInstanceInDay(endOfWeek.toISOString())
                    }
            )
            this.y_axis.push(0);
        }
    }

    generateYAxis(list:any){
        for(var product of list){
            var creationDay= new Date(product['createdAt']);
            for(var weekends in this.endOfWeekDays){
                if(creationDay.getDate() <= this.endOfWeekDays[weekends]){
                    var amount:number= product['totalWithTax'] ? parseFloat(product['totalWithTax'])/100:1;
                    this.y_axis[weekends]=this.y_axis[weekends]+amount;
                    break;
                }
            }
        }
    }
}