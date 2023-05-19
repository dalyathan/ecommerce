import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {Type} from "../../generated-types";
import {DataService, ModalService} from "@etech/admin-ui/package/core";
import {CmsResolver} from "../../providers/routing/cms-resolver";

@Component({
    selector: 'policies',
    templateUrl: './policies.component.html',
    styleUrls: ['./policies.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class PoliciesComponent implements OnInit {
    description: String
    policies = [
        {
            name: 'RETURN',
            description: 'Return'
        },
        {
            name: "SHIPPING",
            description: "shipping"
        },
        {name: "PRIVACY", description: "privacy"},
        {name: "TERMS AND CONDITIONS", description: "terms are good"},
        {name: "COOKIE POLICY", description: "terms are good"},
        {name: "WARRANTY POLICY", description: "terms are good"}
    ]
    type: Type = Type.POLICIES
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
                    cms?.content ? this.policies = JSON.parse(cms?.content?.join()) : null;
                }}
            )})
    }
    update(): void {
        let updateInput = {
            content: [JSON.stringify(this.policies)],
            cmsType: this.type,
        }
        this.cmsResolver.updateCms(updateInput,'policies')
    }
}
