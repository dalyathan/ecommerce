import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {Router} from '@angular/router';
import { jsPDF } from "jspdf";
import{take} from 'rxjs/operators';
import { APPROVE_MUATION, MAKE_QUOTE_SEEN, DELETE_QUOTE, QUERY, REGENRATE_QUOTE } from './quote-resolver.graphql';
import { NotificationService } from '@etech/admin-ui/package/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {QuoteFilter} from './generated-admin-types';
@Component({
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class GreeterComponent implements OnInit{
  isModalVisible: boolean = false;
  public tabsVal: boolean[] = [false, false, false]
  quotes: any[] = [];
  currentPage: number =1;
  columns : string[] = ['Subject','Customer Phone', 'Customer Email',
  'Status', 'Type', 'Is read?',
  'Created At', 'Actions']
  itemsPerPage: number=10;
  modalFromEmail: string = '';
   modalFromPhone: string = '';
   modalSubject: string = '';
  modalMessage: string = '';
  modalCompanyName: string = '';
  filterBySeen:boolean= false;
  filterByApproved:boolean= false;
  filter: QuoteFilter={};

  constructor(private apollo: Apollo, private router: Router, 
    private notificationService: NotificationService,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef){
    
  }

  ngOnInit(): void {
   this.fetch();
  }

  go(msg){
    console.log(msg);
     this.modalSubject = msg.subject;
     this.modalFromEmail = msg.fromEmail;
     this.modalCompanyName = msg.modalCompanyName;
     this.modalMessage = msg.msg;
     this.modalFromPhone = msg.fromPhone;
     this.isModalVisible = true;
   }

  
  setPage(event:number){
    this.currentPage= event;
  }
  
  setItemsPerPage(event:number){
    this.itemsPerPage= event;
  }

  downloadAll(mode){
    const doc = new jsPDF();
    let i=0;
    for(const obj of this.quotes){
      //if(obj.is_seen != mode) continue;
      //obj as {first_name: string, last_name: string, email: string, phone_number: string, createdAt: string, is_seen: string};
      if(mode==1){
         if(obj.isseen || obj.isSpecial){
          continue;
         }
      }
      else if(mode==2){
        if(!obj.isseen || obj.isSpecial){
          continue;
         }
      }
      else if(mode==3){
        if(obj.isseen || !obj.isSpecial){
          continue;
         }
      }
      else if(mode==4){
        if(!obj.isseen || !obj.isSpecial){
          continue;
         }
      }
      doc.setFont("times", "italic", "bold")
     
      doc.setFontSize(20)
      doc.text("Quote Us Message", 10, 10+i)
      doc.setFontSize(5)
      doc.setTextColor("red");
      doc.text(`From: ${obj.fromEmail} ${obj.last_name}, `, 20, 20+i)
      doc.setTextColor("green");
      doc.text(`Phone: ${obj.fromPhone}, `, 20, 25+i)
      doc.setTextColor("blue");
      doc.text(`Subject: ${obj.subject}, `, 20, 30+i)
      doc.text(`Message: ${obj.msg}, `, 20, 50+i)
      doc.text(`Sent At: ${obj.createdAt}, `, 20, 60+i)
      i+=10
    }
    doc.save("all_quotes.pdf");
   }

   openFile(result:any){
    const token= `Bearer ${localStorage.getItem('vnd_authToken')?.replace('"','').replace('"','')}`;
    const headers = new HttpHeaders().set('authorization',token);
    this.httpClient
      .get(result.assetUrl, {headers,responseType: 'blob' as 'json'})
      .pipe(take(1)).toPromise().then(
        (response: any) =>{
            let dataType = response.type;
            let binaryData:any[] = [];
            binaryData.push(response);
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute("target","_blank");
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
    )
  }

   async approveQuote(id: string){
      const result:any= await this.apollo.mutate({mutation: APPROVE_MUATION, variables: {id}})
      .pipe(take(1)).toPromise();
      if(result.data.approveQuote){
        for(let itemIndex in this.quotes){
          if(this.quotes[itemIndex].id === id && id === result.data.approveQuote.id){
            this.quotes= this.quotes.slice(0, parseInt(itemIndex))
            .concat([result.data.approveQuote])
            .concat(this.quotes.slice(parseInt(itemIndex)+1));
            this.cdr.detectChanges();
            this.notificationService.success(`Quote approved successfully. 
            An email containing the quote has been sent to the user`)
            break;
          }
        }
      }else{
        this.notificationService.error(`Quote couldn't be approved`)
      }
   }
   
  async inv(id: string){
    const result:any=await this.apollo.mutate( {mutation:MAKE_QUOTE_SEEN, variables: {id}  } )
    .pipe(take(1)).toPromise();
    if(result.data.makeQuoteSeen){
      for(let itemIndex in this.quotes){
        if(this.quotes[itemIndex].id === id && id === result.data.makeQuoteSeen.id){
          this.quotes= this.quotes.slice(0, parseInt(itemIndex))
          .concat([result.data.makeQuoteSeen])
          .concat(this.quotes.slice(parseInt(itemIndex)+1));
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
    const result:any=await this.apollo.mutate( {mutation:DELETE_QUOTE, variables: {id}  } )
    .pipe(take(1)).toPromise();
    if(result.data.deleteQuote){
      for(let itemIndex in this.quotes){
        if(this.quotes[itemIndex].id === id && id === result.data.deleteQuote.id){
          this.quotes= this.quotes.slice(0, parseInt(itemIndex)).concat(this.quotes.slice(parseInt(itemIndex)+1));
          this.cdr.detectChanges();
          this.notificationService.success(`Quote successfully deleted`)
          break;
        }
      }
    }else{
      this.notificationService.error(`Could not delete quote`)
    }
  }

 
  async fetch(){
    this.apollo.query({query:QUERY, variables:{filter: this.filter}}).pipe(take(1)).toPromise().then(({data, loading}) =>{
      if(!loading){
        this.quotes = ( data as {getAllQuotes: any[]}).getAllQuotes; 
        this.cdr.detectChanges();
      }
    }); 
  }

  applyFilter(event:any){
    this.filter={};
    if(this.filterBySeen){
      this.filter.isSeen=true;
    }
    if(this.filterByApproved){
      this.filter.isApproved=true;
    }
    this.fetch();
  }

  async regenerate(id: string){
    const result:any= await this.apollo.mutate({mutation: REGENRATE_QUOTE, variables: {id}})
      .pipe(take(1)).toPromise();
      if(result.data.regenerateQuote){
        for(let itemIndex in this.quotes){
          if(this.quotes[itemIndex].id === id && id === result.data.regenerateQuote.id){
            this.quotes= this.quotes.slice(0, parseInt(itemIndex))
            .concat([result.data.regenerateQuote])
            .concat(this.quotes.slice(parseInt(itemIndex)+1));
            this.cdr.detectChanges();
            this.notificationService.success(`Quote successfully regenerated`)
            break;
          }
        }
      }else{
        this.notificationService.error(`Quote couldnt be  regenerated`)
      }
  }
}
