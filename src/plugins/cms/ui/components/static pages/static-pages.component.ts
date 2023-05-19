import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import { Type} from "../../generated-types";
import {DataService, ModalService} from "@etech/admin-ui/package/core";
import {CmsResolver} from "../../providers/routing/cms-resolver";

@Component({
    selector: 'static-pages',
    templateUrl: './static-pages.component.html',
    styleUrls: ['./static-pages.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class StaticPagesComponent implements OnInit {
    description: String
    staticPages = [
        {
            name: 'ABOUT',
            description: 'About'
        },
        {
            name: "MISSION",
            description: "Mission"
        },
        {name: "VISION", description: "VISION"},
        {name: "VALUE", description: "Value"}
    ]
    type: Type = Type.STATIC
    constructor(
        private modalService: ModalService,
        protected dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private cmsResolver:CmsResolver
    ) {

    }

    ngOnInit(): void {
   this.getCms()
    }
    getCms(){
        this.cmsResolver.getCms([this.type]).subscribe(result => {
            result?.forEach((cms)=>{
                if(cms.cmsType===this.type) {
                    cms?.content ? this.staticPages = JSON.parse(cms?.content?.join()) : null;
                }}
            )})
    }
    update(): void {
        let updateInput = {
            content: [JSON.stringify(this.staticPages)],
            cmsType: this.type,
        }
      this.cmsResolver.updateCms(updateInput,'static')
    }
}
