import { Component } from '@angular/core';
import { Apollo, gql, } from 'apollo-angular';
import { trigger, style, animate, transition } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { default as dayjs } from 'dayjs';
const MAKSEE = gql`
mutation MakeInstantMessageSeen($ids: [ID]!){
  makeSeenByAdmin(ids: $ids){
    success
  }
}
`;
const GETQU = gql`
query GetAllInstantMessages{
  getAllInstantMessages{
    id
    msg
    userEmail
    isFromAdmin
    firstName
    lastName
    isSeen
    createdAt
  }
}
`

const SENDMU = gql`
mutation WriteInstantMessage($userEmail: String!, $msg: String!){
  writeInstantMessage(msg: $msg, isFromAdmin: true, userEmail: $userEmail){
   id
 }
}`;
@Component({
  
  selector: 'page',
  templateUrl: 'page.component.html',
  styleUrls: ['./page.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
      ]
    )
  ],

})
export class GreeterComponent {
  //private static readonly
  messageToSend = ""
  public currentIndex: number | null= null
   public users: any[] = [
  ]
  messages:any = []; 
  isMessenderVisible = false;

  getUnseenLen(messages: any[]){
    return Array.from(messages.filter(message => !message.isSeen && !message.isFromAdmin)).length
  }

  async sendMessage(){
    if( this.messageToSend && this.messageToSend!==null && this.messageToSend!==''){
      await this.apollo.mutate( 
         {mutation:SENDMU, variables: {
           msg: this.messageToSend, 
           userEmail: this.users[this.currentIndex as any].user.email
         }  
       } ).pipe(take(1)).toPromise();
       this.messageToSend = ""
    }
  }

  hideChat(){
    this.isMessenderVisible = false;
    this.currentIndex = null
  }

  async makeMessageSeen(ids:string[]){
    await this.apollo.mutate({mutation: MAKSEE, variables: {ids}}).pipe(take(1))
    .toPromise();
  //  console.log(`Making ${id} seen`)
  }

  setChat(index: number){
    if(typeof index !== 'number') return;
    if(index > this.users.length) return;
    this.currentIndex = index;
    this.isMessenderVisible = true;
    const unseenIds:string[]= [];
    this.messages.forEach(message => {
      // console.log(message.userEmail);
      if(!message.isFromAdmin && message.userEmail === this.users[index].user.email) {
        unseenIds.push(message.id);
      }      
    })
    if(unseenIds.length){
      this.makeMessageSeen(unseenIds);
    }
    // console.log(`Seeting messages...${this.users[this.currentIndex as any].messages}`)
  }

  constructor(private apollo: Apollo, private activatedRoute: ActivatedRoute){
    this.apollo.watchQuery({query:GETQU, pollInterval: 3000}).valueChanges
    .subscribe(({data, loading}) =>{
      this.users = []
      if(!loading){ 
      this.messages = ( data as {getAllInstantMessages: any[]}).getAllInstantMessages;
      const userSet = new Set();
      this.messages.forEach(message => {
        // if(message.userEmail !== ''){
          userSet.add(message.userEmail)
        // }else{
        //   userSet.add(message.ipAndBrowser)
        // }
      })
      const usersArray = [...userSet]
      usersArray.forEach(identifier => {
        let unseen = 0;
        const firstName = this.messages.find((message) => 
        message.userEmail ==identifier && message.firstName!=="")?.firstName ?? "Anon ";
           const lastName = this.messages.find((message) => message.userEmail ==identifier && message.lastName!=="")?.lastName ?? "-";
           const messagess: any = [];
           this.messages.forEach(message => {
            // if(message.userEmail!==''){
              if(message.userEmail == identifier ){
                messagess.push(message)
                if(!message.isSeen && !message.isFromAdmin) unseen++;
              }
           })
           this.users.push({user: {email: identifier, firstName, 
            lastName}, messages: messagess, unseen})
            this.activatedRoute.queryParams.pipe(take(1)).toPromise().then((value)=>{
              // console.log(value);
              if(value.email){
                this.setChat(this.users.findIndex((item)=> item.user.email === (decodeURIComponent(value.email))));
              }
            });
      })
      this.users=this.users.sort((a, b) => {
        return dayjs(b.messages[0].createdAt).diff(dayjs(a.messages[0].createdAt));
      });
    }
    });
  }
}