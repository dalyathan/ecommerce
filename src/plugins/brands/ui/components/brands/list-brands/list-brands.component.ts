import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {gql} from 'apollo-angular';
import {DataService,ModalService,NotificationService} from "@etech/admin-ui/package/core";
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  switchMap,take
} from 'rxjs/operators';
import { EMPTY } from 'rxjs';
@Component({
  selector: 'list-brands-vendure',
  templateUrl: './list-brands.component.html',
  styleUrls: ['./list-brands.component.scss']
})
export class ListBrandsComponent implements OnInit{
  salesList: any[]=[];
  salesListIsLoading: boolean= true;
  currentPage: number =1;
  itemsPerPage: number=10;

  constructor(private dataService: DataService,private modalService: ModalService, private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.add();
  }

  async add(){
    const brandsGraphql=`query AllBrands{
      brands{
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
    this.dataService.query(gql(brandsGraphql)).mapSingle(data=> (data as any).brands).toPromise().then((result)=>{
      let updatedList:any[]=[];
      for(let brand of result){
        updatedList.push({
          id: (brand as any).id,
          name: (brand as any).name,
          description: unescape((brand as any).description),
          icon: (brand as any).icon != null?(brand as any).icon:'',
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

  async deleteBrand(id:string){
    let deleteBrandGQL=gql`
      mutation DeleteBrand{
        deleteBrand(id: ${id})
      }
    `;
    const response:any= await this.modalService
      .dialog({
          title: 'Delete Brand',
          buttons: [
              { type: 'secondary', label: _('common.cancel') },
              { type: 'danger', label: _('common.delete'), returnValue: true },
          ],
      })
      .pipe(
          switchMap(response => (response ? this.dataService.mutate(deleteBrandGQL) : EMPTY)),
      ).pipe(take(1)).toPromise();
      if(response){
        for(let itemIndex in this.salesList){
          if(this.salesList[itemIndex].id === id && id === response.deleteBrand){
              this.salesList= this.salesList.slice(0, parseInt(itemIndex)).concat(this.salesList.slice(parseInt(itemIndex)+1));
              this.changeDetectorRef.detectChanges();
              break;
            }
          }
          this.notificationService.success(_('common.notify-delete-success'), {
              entity: 'Brand',
          });
      }
  }
}