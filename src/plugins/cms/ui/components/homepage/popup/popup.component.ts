import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Type} from "../../../generated-types";
import {AssetPickerDialogComponent, DataService, ModalService, NotificationService,} from "@etech/admin-ui/package/core";
import {CmsResolver} from "../../../providers/routing/cms-resolver";
import {DomSanitizer} from '@angular/platform-browser';
import {take} from 'rxjs/operators';

interface popupObject {
    title: string,
    description: string,
    buttonText: string
    enabled: Boolean
}

@Component({
    selector: 'popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
    popupObject: popupObject = {title: "", description: "", buttonText: "", enabled: true};
    image: String | undefined;
    type: Type = Type.POPUP;
    featuredAssetId: string | '';

    constructor(
        private modalService: ModalService,
        protected dataService: DataService,
        private cmsResolver: CmsResolver,
        private sanitized: DomSanitizer,
    ) {

    }

    ngOnInit(): void {
        this.getCms()
    }

    makeInlineCssSafe(content:string){
        return this.sanitized.bypassSecurityTrustHtml(content)
    }

    update(): void {
        let updateInput = {
            content: [JSON.stringify(this.popupObject)],
            featuredAssetId: this.featuredAssetId,
            cmsType: this.type,
            assetIds: [this.featuredAssetId]
        }
        this.cmsResolver.updateCms(updateInput, 'popup')
    }

    getCms() {
        this.cmsResolver.getCms([this.type]).toPromise().then(result => {
            result?.forEach((cms) => {
                if (cms.cmsType === this.type) {
                    cms?.content ? this.popupObject = JSON.parse(cms?.content?.join()) : null;
                    this.image = cms?.featuredAsset?.preview;
                    this.featuredAssetId = cms?.featuredAsset?.id || '';
                }
            })
        })
    }

    async selectAsset() {
        const result= await this.modalService
            .fromComponent(AssetPickerDialogComponent, {
                size: 'md',
            }).pipe(take(1)).toPromise();
            if (result && result.length) {
                this.image = result[0].preview
                this.featuredAssetId = result[0].id
            }
    }
}
