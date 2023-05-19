import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Type} from "../../../generated-types";
import {AssetPickerDialogComponent, DataService, ModalService,} from "@etech/admin-ui/package/core";
import {CmsResolver} from "../../../providers/routing/cms-resolver";
import {DomSanitizer} from '@angular/platform-browser';
import {
     take
  } from 'rxjs/operators';
interface advertisementObject {
    title: string,
    overview: string,
    description: string,
    buttonText: string
}

@Component({
    selector: 'advertisement',
    templateUrl: './advertisement.component.html',
    styleUrls: ['./advertisement.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
})
export class AdvertisementComponent implements OnInit {
    advertisementObject: advertisementObject = {title: "", overview: "", description: "", buttonText: ""};
    image: String | undefined = 'http://localhost:3000/assets/preview/8b/bannerb__preview.webp';
    type: Type = Type.ADVERTISEMENT;
    featuredAssetId: string | '';

    constructor(
        private modalService: ModalService,
        protected dataService: DataService,
        private cmsResolver: CmsResolver,
        public sanitized: DomSanitizer,
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
            content: [JSON.stringify(this.advertisementObject)],
            featuredAssetId: this.featuredAssetId,
            cmsType: this.type,
            assetIds: [this.featuredAssetId]
        }
        this.cmsResolver.updateCms(updateInput, 'Advertisement')
    }

    getCms() {
        this.cmsResolver.getCms([this.type]).toPromise().then(result => {
            result?.forEach((cms) => {
                if (cms.cmsType === this.type) {
                    cms?.content ? this.advertisementObject = JSON.parse(cms?.content?.join()) : null;
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
