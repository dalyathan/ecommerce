

import { Component, ChangeDetectorRef } from '@angular/core';
import { Apollo, } from 'apollo-angular';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from '@etech/admin-ui/package/core';
import {take} from 'rxjs/operators';
import { EDIT_QUERY, CREATE_QUERY, ENABLE_MUTATION, DELETE_MUTATION, QUERY, DISABLE_MUTATION } from './gql.types';

@Component({
  
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],

})
export class GreeterComponent {
  modalAnswer = "";
  currentPage: number =1;
  modalQuestion = ""
  faqs: any[] = []
  isModalVisible: boolean = false;
  editingId: string = "";
  editToggle: boolean = false; //if true then we are creating 
  columns : string[] = ['Frequently Asked Questions']
  itemsPerPage: number=10;
  tagBeingEdited: string[];
  constructor(private apollo: Apollo, public sanitized: DomSanitizer, 
    private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef){
    this.apollo.query({query:QUERY}).pipe(take(1)).toPromise()
    .then(({data, loading}) =>{
      if(!loading){
         this.faqs = ( data as {getFaqs: any[]}).getFaqs;
        }
    });
  }

  setPage(event:number){
    this.currentPage= event;
  }

  setItemsPerPage(event:number){
    this.itemsPerPage= event;
  }
  
  editFaqById(id: string, answer: string, question: string,tags: string[]){
    
    this.setUpEdit();
    this.tagBeingEdited=tags;
    this.editingId = id;
    this.modalAnswer= answer;
    this.modalQuestion = question;
    this.changeDetectorRef.detectChanges();
    
  }

  submit(){
    if(this.editToggle) this.editFaq();
    else if(!this.editToggle) this.createFaq();
    this.isModalVisible = false
  }

  async editFaq(){
    if(this.editingId.trim().length === 0) return; 
    const result:any=await this.apollo.mutate({mutation: EDIT_QUERY, 
      variables: {id: this.editingId, answer: this.modalAnswer, 
        question: this.modalQuestion, tags: this.tagBeingEdited }})
    .pipe(take(1)).toPromise();
    if(result.data.editFaq){
      for(let itemIndex in this.faqs){
        if(this.faqs[itemIndex].id === this.editingId && this.editingId === result.data.editFaq.id){
          this.faqs= this.faqs.slice(0, parseInt(itemIndex))
          .concat([result.data.editFaq])
          .concat(this.faqs.slice(parseInt(itemIndex)+1));
          this.changeDetectorRef.detectChanges();
          this.notificationService.success('FAQ Edited Successfully');
          break;
        }
      }
    }else{
      this.notificationService.error(`FAQ couldn't be edited`)
    }
  }

  async createFaq(){
    const result:any=await this.apollo.mutate({mutation: CREATE_QUERY, 
      variables: {answer: this.modalAnswer, 
        question: this.modalQuestion,tags: this.tagBeingEdited}}).pipe(take(1)).toPromise();
        this.faqs=[...this.faqs, result.data.createFaq];
    this.notificationService.success('Question Created Successfully');
  }

  makeInlineCssSafe(content:string){
    return this.sanitized.bypassSecurityTrustHtml(content)
  }

  setUpEdit(){
    this.isModalVisible = true;
    this.editToggle = true;
  }

  setUpCreate(){
    this.isModalVisible = true;
    this.editToggle = false;
    this.modalAnswer = "";
    this.modalQuestion = ""
  }
  
  async disableFaq(id: string){
    const result:any=await this.apollo.mutate({mutation: DISABLE_MUTATION, variables: {id: id}})
    .pipe(take(1)).toPromise();
    if(result.data.disableFaq){
      for(let itemIndex in this.faqs){
        if(this.faqs[itemIndex].id === id && id === result.data.disableFaq.id){
          this.faqs= this.faqs.slice(0, parseInt(itemIndex))
          .concat([result.data.disableFaq])
          .concat(this.faqs.slice(parseInt(itemIndex)+1));
          this.changeDetectorRef.detectChanges();
          this.notificationService.success('FAQ Successfully Disabled');
          break;
        }
      }
    }else{
      this.notificationService.error(`FAQ couldn't be disabled`)
    }
  }

  async enalbeFaq(id: string){
    const result:any=await this.apollo.mutate({mutation: ENABLE_MUTATION, variables: {id: id}}, )
    .pipe(take(1)).toPromise();
    if(result.data.enableFaq){
      for(let itemIndex in this.faqs){
        if(this.faqs[itemIndex].id === id && id === result.data.enableFaq.id){
          this.faqs= this.faqs.slice(0, parseInt(itemIndex))
          .concat([result.data.enableFaq])
          .concat(this.faqs.slice(parseInt(itemIndex)+1));
          this.changeDetectorRef.detectChanges();
          this.notificationService.success('FAQ successfully enabled');
          break;
        }
      }
    }else{
      this.notificationService.error(`FAQ couldn't be enabled`)
    }
   
  }

 async deleteFaq(id: string){
    const result:any=await this.apollo.mutate({mutation: DELETE_MUTATION, variables: {id: id}})
    .pipe(take(1)).toPromise();
    if(result.data.deleteFaq){
      for(let itemIndex in this.faqs){
        if(this.faqs[itemIndex].id === id && id === result.data.deleteFaq.id){
          this.faqs= this.faqs.slice(0, parseInt(itemIndex))
          .concat(this.faqs.slice(parseInt(itemIndex)+1));
          this.changeDetectorRef.detectChanges();
          this.notificationService.success('FAQ successfully deleted');
          break;
        }
      }
    }else{
      this.notificationService.error(`FAQ couldn't be deleted`)
    }
  }
  closeModal(){
    this.isModalVisible = false;
  }

  toDate(value:any){
    return new Date().toDateString()
  }
}
