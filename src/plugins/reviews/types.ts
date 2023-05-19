import { ProductBrand } from '../brands/api/entities/brand-entity';
import { ProductIndustry } from '../brands/api/entities/industry-entity';
import { ProductReview } from './entities/product-review.entity';

export type ReviewState = 'new' | 'approved' | 'rejected';

declare module '@etech/core' {
    interface CustomProductFields {
        brand: ProductBrand;
        industries: ProductIndustry[];
        reviewCount: number;
        reviewRating: number;
        featuredReview?: ProductReview;
    }
}
