import { Component, ChangeDetectorRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { jsPDF } from "jspdf";
import {take} from 'rxjs/operators';
import { DELQUERY, QUERY, SEENQUERY } from './gql.types';
import { NotificationService } from '@etech/admin-ui/package/core';
import {ContactUsMessage}  from './generated-shop-types';
@Component({
  
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],

})
export class GreeterComponent {
   messages:  ContactUsMessage[] = [];
   isModalVisible = false;
   modalFirstName = ''
    modalLastName =''
    modalFromEmail = ''
    modalFromPhone = ''
    modalSubject = ''
    modalMessage = ''

    constructor(private apollo: Apollo,private notificationService: NotificationService, private cdr: ChangeDetectorRef){
      this.apollo.query({query:QUERY, /*pollInterval: 300*/}).pipe(take(1)).toPromise()
      .then(({data, loading}) =>{
      //  console.log(data)
        if(!loading) this.messages =  (data as any).getAllContactUsMessages;
      });
    }

   downloadAll(mode: boolean){

    const doc = new jsPDF();
    doc.setFont("times", "italic", "bold")
      
    doc.setFontSize(40)
    doc.text("Contact Us Message", 10, 10)
    doc.setFontSize(20)
    let i = 0;
    for(const obj of this.messages.filter(msg => msg.is_seen)){
        doc.text('-------------------------------------------', 20, 18+i)
        doc.text(`From: ${obj.first_name} ${obj.last_name} `, 20, 25+i)
      
        doc.text(`Email: ${obj.email}`, 20, 35+i)

        doc.text(`Phone Number: ${obj.phone_number} `, 20, 45+i)
        
        doc.text(`Message:${this.normalize(obj.message, 50)}`, 20, 55+i);
        console.log(obj.message.length, obj.message.length/50);
        doc.text(`Sent At: ${obj.createdAt} `, 20, 80 +( obj.message.length/50) * 10+i)
        i+= 66 + (obj.message.length/50)*10;

    }
    doc.save("contact_us.pdf");
   }
   private normalize(str: string, l: number){
          let ret = "";
          if(str.length <= l) return str;
          let arr = str.split('');
          for(let i=0;i<str.length/l;i++){
              arr.splice(i*l, 0, '\n');
          }
          return arr.join('')
   }
   download(obj: {message: string, first_name: string, last_name: string, email: string, phone_number: string, createdAt: string, is_seen: string}){
      // downloadObjects([{
      //     object: {hi:'dsd'}, title:'dsds'}], 'test.pdf')
      const doc = new jsPDF();
      doc.setFont("times", "italic", "bold")
     
      doc.setFontSize(40)
      doc.text("Contact Us Message", 10, 10)
      doc.setFontSize(20)

      doc.text(`From: ${obj.first_name} ${obj.last_name} `, 20, 25)
    
      doc.text(`Email: ${obj.email}`, 20, 35)

      doc.text(`Phone Number: ${obj.phone_number} `, 20, 45)
      
      doc.text(`Message:${this.normalize(obj.message, 50)}`, 20, 55);
      console.log(obj.message.length, obj.message.length/50);
      doc.text(`Sent At: ${obj.createdAt} `, 20, 80 +( obj.message.length/50 + 1) * 10)

      doc.save("contact_us.pdf");
   }

  refresh(){
    //  this.messages = []   
    
  }
  go(msg){
   // console.log('http://localhost:3000/admin/quotes/detail?id='+id)
    // window.location.href = '/admin/extensions/contactus/details?id='+id
    this.modalFirstName = msg.first_name;
    this.modalFromEmail = msg.email;
    this.modalLastName = msg.last_name;
    this.modalMessage = msg.message;
    this.modalFromPhone = msg.phone_number;
    this.isModalVisible = true;
    this.makeMessageSeen(msg.id)
  }
  async makeMessageSeen(id: string){
  // console.log("Invalidating...")
    const result:any= await this.apollo.mutate( {mutation:SEENQUERY, variables: {id}  } )
    .pipe(take(1)).toPromise();
    if(result.data.makeContactUsMessageSeen){
      for(let itemIndex in this.messages){
        if(this.messages[itemIndex].id === id && id === result.data.makeContactUsMessageSeen.id){
          this.messages= this.messages.slice(0, parseInt(itemIndex))
          .concat([result.data.makeContactUsMessageSeen])
          .concat(this.messages.slice(parseInt(itemIndex)+1));
          this.cdr.detectChanges();
          this.notificationService.success(`Quote successfully marked as read`)
          break;
        }
      }
    }else{
      this.notificationService.error(`Quote couldnt be  marked as read`)
    }
  }
  async delete(id: string){  
    const data= await this.apollo.mutate( {mutation:DELQUERY, variables: {id}  } )
    .pipe(take(1)).toPromise();
  }
  
}
