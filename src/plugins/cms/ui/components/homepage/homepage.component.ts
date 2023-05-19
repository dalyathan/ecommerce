import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CmsResolver} from "../../providers/routing/cms-resolver";
import {Type} from "../../generated-types";

@Component({
    selector: 'homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class HomepageComponent{
    constructor(   private cmsResolver:CmsResolver) {
    }


}
