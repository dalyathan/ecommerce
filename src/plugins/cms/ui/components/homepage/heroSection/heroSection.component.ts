import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Type} from "../../../generated-types";
import {CmsResolver} from "../../../providers/routing/cms-resolver";
import {AssetPickerDialogComponent, DataService, ModalService, NotificationService,} from "@etech/admin-ui/package/core";
import {DomSanitizer} from '@angular/platform-browser';
import {take} from 'rxjs/operators';
interface heroSectionObject {
    title: string,
    overview: string,
    description: string,
    buttonText:string,
    link:string,
}

@Component({
    selector: 'heroSection',
    templateUrl: './heroSection.component.html',
    styleUrls: ['./heroSection.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
})
export class HeroSectionComponent  implements OnInit{
    heroSectionObject: heroSectionObject = {title: "", overview: "", description: "",buttonText:"",link:""};
    image: String | undefined;// = 'http://localhost:3000/assets/preview/8b/bannerb__preview.webp';
    type: Type = Type.HERO_SECTION;
    featuredAssetId: string | '';
    youtubeURL="https://www.youtube.com/watch?v=";

    constructor(
        private modalService: ModalService,
        protected dataService: DataService,
        private cmsResolver:CmsResolver,
        private sanitized: DomSanitizer,
        private notificationService: NotificationService,
    ) {
        // this.getCms();
    }

    ngOnInit(): void {
        this.getCms();
    }

    makeInlineCssSafe(content:string){
        return this.sanitized.bypassSecurityTrustHtml(content)
    }

    async update(): Promise<void> {
        let youtubeRegexChecker= new RegExp(`^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$`);
        if(!youtubeRegexChecker.test(this.heroSectionObject.link)){
            this.notificationService.error('Provided link is not a youtube link');
            return;
        }
        if(this.heroSectionObject.link.split('=').length == 2){
            this.heroSectionObject.link= this.heroSectionObject.link.split('=')[1];
        }else{
            const splitted= this.heroSectionObject.link.split('.be/');
            if(splitted.length!=2){
                this.notificationService.error('Provided link is not a youtube link');
                return;
            }
            this.heroSectionObject.link= splitted[1];
        }
        let updateInput = {
            content: [JSON.stringify(this.heroSectionObject)],
            featuredAssetId: this.featuredAssetId,
            cmsType: this.type,
            assetIds: [this.featuredAssetId]
        }
        this.cmsResolver.updateCms(updateInput,'Hero Section');
        this.heroSectionObject.link= this.youtubeURL + this.heroSectionObject.link;
    }

    getCms(){
        this.cmsResolver.getCms([this.type]).toPromise().then(result => {
            // console.log(result);
            result?.forEach((cms) => {
                if (cms.cmsType === this.type) {
                    // console.log(cms);
                    cms?.content ? this.heroSectionObject = JSON.parse(cms?.content?.join()) : null;
                    this.image = cms?.featuredAsset?.preview;
                    this.featuredAssetId = cms?.featuredAsset?.id || '';
                }
            })
            this.heroSectionObject.link= this.youtubeURL + this.heroSectionObject.link;
        }).catch((e)=>{
            console.log(e);
        });
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
