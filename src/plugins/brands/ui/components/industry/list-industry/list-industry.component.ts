import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {gql} from 'apollo-angular';
import {DataService,ModalService,NotificationService} from "@etech/admin-ui/package/core";
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  switchMap, take
} from 'rxjs/operators';
import { EMPTY } from 'rxjs';
@Component({
  selector: 'list-industry-vendure',
  templateUrl: './list-industry.component.html',
  styleUrls: ['./list-industry.component.scss']
})
export class ListIndustryComponent implements OnInit {
  salesList: any[]=[];
  salesListIsLoading: boolean= true;
  currentPage: number =1;
  itemsPerPage: number=10;

  constructor(private dataService: DataService,private modalService: ModalService, 
      private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.add();
  }

  async add(){
    const brandsGraphql=`query AllIndustries{
      industries{
        id
        name
        description
        icon{
          id
          createdAt
          updatedAt
          name
          type
          fileSize
          mimeType
          width
          height
          source
          preview
          focalPoint{
            x
            y
          }
          customFields
        }
      }
    }`;
    this.dataService.query(gql(brandsGraphql)).mapSingle(data=> (data as any).industries).toPromise().then((result)=>{
      let updatedList:any[]=[];
      for(let industry of result){
        updatedList.push({
          id: (industry as any).id,
          name: (industry as any).name,
          description: unescape((industry as any).description),
          icon: (industry as any).icon !== null?(industry as any).icon:'',
        });
      }
      this.salesList= updatedList;
      this.salesListIsLoading= false;
    });
  }

  setPage(event:number){
    this.currentPage= event;
  }

  setItemsPerPage(event:number){
    this.itemsPerPage= event;
  }

  async deleteIndustry(id:string){
    let deleteIndustryGQL=gql`
      mutation DeleteIndustry{
        deleteIndustry(id: ${id})
      }
    `;
    const response:any= await this.modalService
    .dialog({
        title: 'Delete Industry',
        buttons: [
            { type: 'secondary', label: _('common.cancel') },
            { type: 'danger', label: _('common.delete'), returnValue: true },
        ],
    })
    .pipe(
        switchMap(response => (response ? this.dataService.mutate(deleteIndustryGQL) : EMPTY)),
    ).pipe(take(1)).toPromise();
    if(response){
        this.notificationService.success(_('common.notify-delete-success'), {
            entity: 'Industry',
        });
      for(let itemIndex in this.salesList){
        if(this.salesList[itemIndex].id === id && id === response.deleteIndustry){
          this.salesList= this.salesList.slice(0, parseInt(itemIndex)).concat(this.salesList.slice(parseInt(itemIndex)+1));
          this.changeDetectorRef.detectChanges();
          break;
        }
      }
    }
  }

}