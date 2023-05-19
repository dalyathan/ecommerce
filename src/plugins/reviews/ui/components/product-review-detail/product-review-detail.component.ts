import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BaseDetailComponent,
    DataService,
    NotificationService,
    ServerConfigService,
} from '@etech/admin-ui/package/core';
import { Observable, of } from 'rxjs';
import { filter, map, mapTo, switchMap } from 'rxjs/operators';

import { ReviewState } from '../../common/ui-types';
import {
    ApproveReview,
    ProductReview,
    RejectReview,
    UpdateProductReviewInput,
    UpdateReview,
} from '../../generated-types';

import { APPROVE_REVIEW, REJECT_REVIEW, UPDATE_REVIEW } from './product-review-detail.graphql';
import {take} from 'rxjs/operators';
@Component({
    selector: 'kb-product-review-detail',
    templateUrl: './product-review-detail.component.html',
    styleUrls: ['./product-review-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ProductReviewDetailComponent
    extends BaseDetailComponent<ProductReview.Fragment>
    implements OnInit
{
    detailForm: FormGroup;
    reviewState$: Observable<ReviewState>;

    constructor(
        route: ActivatedRoute,
        router: Router,
        serverConfigService: ServerConfigService,
        private formBuilder: FormBuilder,
        protected dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) {
        super(route, router, serverConfigService, dataService);
        this.detailForm = this.formBuilder.group({
            summary: ['', Validators.required],
            body: '',
            rating: [0, Validators.required],
            authorName: ['', Validators.required],
            authorLocation: '',
            state: '',
            response: '',
        });
    }

    ngOnInit(): void {
        this.init();
        this.reviewState$ = this.entity$.pipe(map(review => review.state as ReviewState));
    }

    async approve() {
        try{
            await this.saveChanges()
                .pipe(
                    switchMap(() =>
                        this.dataService.mutate<ApproveReview.Mutation, ApproveReview.Variables>(APPROVE_REVIEW, {
                            id: this.id,
                        }),
                    ),
                )
                .pipe(take(1)).toPromise();
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.notificationService.success('Review was approved');
        }catch(e){
            this.notificationService.error('An error occurred when attempting to approve the review');
        }
    }

    async reject() {
        try{
            await this.saveChanges()
                .pipe(
                    switchMap(() =>
                        this.dataService.mutate<RejectReview.Mutation, RejectReview.Variables>(REJECT_REVIEW, {
                            id: this.id,
                        }),
                    ),
                )
                .pipe(take(1)).toPromise();
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.notificationService.success('Review was rejected');
        }catch(e){
            this.notificationService.error('An error occurred when attempting to reject the review');
        }
    }

    async save() {
        try{

            await this.saveChanges()
                .pipe(filter(result => !!result))
                .pipe(take(1)).toPromise();
            this.detailForm.markAsPristine();
            this.changeDetector.markForCheck();
            this.notificationService.success('common.notify-update-success', {
                entity: 'ProductReview',
            });
        }catch(e){
            this.notificationService.error('common.notify-update-error', {
                entity: 'ProductReview',
            });
        }
    }

    private saveChanges(): Observable<boolean> {
        if (this.detailForm.dirty) {
            const formValue = this.detailForm.value;
            const input: UpdateProductReviewInput = {
                id: this.id,
                summary: formValue.summary,
                body: formValue.body,
                response: formValue.response,
            };
            return this.dataService
                .mutate<UpdateReview.Mutation, UpdateReview.Variables>(UPDATE_REVIEW, {
                    input,
                })
                .pipe(mapTo(true));
        } else {
            return of(false);
        }
    }

    protected setFormValues(entity: ProductReview.Fragment): void {
        this.detailForm.patchValue({
            summary: entity.summary,
            body: entity.body,
            rating: entity.rating,
            authorName: entity.authorName,
            authorLocation: entity.authorLocation,
            state: entity.state,
            response: entity.response,
        });
    }
}
