import { LanguageCode, mergeConfig } from '@etech/core';
import { testConfig as defaultTestConfig } from '@etech/testing';
import path from 'path';
import { ProductReview } from '../../entities/product-review.entity';

/**
 * We use a relatively long timeout on the initial beforeAll() function of the
 * e2e tests because on the first run (and always in CI) the sqlite databases
 * need to be generated, which can take a while.
 */
export const TEST_SETUP_TIMEOUT_MS = process.env.E2E_DEBUG ? 1800 * 1000 : 120000;

/**
 * For local debugging of the e2e tests, we set a very long timeout value otherwise tests will
 * automatically fail for going over the 5 second default timeout.
 */
// if (process.env.E2E_DEBUG) {
    // tslint:disable-next-line:no-console
    console.log('E2E_DEBUG', process.env.E2E_DEBUG, ' - setting long timeout');
    jest.setTimeout(180000 * 1000);
// }

export const testConfig = mergeConfig(defaultTestConfig, 
    {
    dbConnectionOptions:{
        type: 'mysql',
        database: 'ecommerce_test',
        host: 'localhost',
        port: 3306,
        username: 'db_tester',
        password: 'test123',
        synchronize: false
    },
    apiOptions:{
        shopApiPlayground: true
    },
    
    // customFields:{
    //     Product:[
    //         {
    //             name: 'reviewRating',
    //             label: [{ languageCode: LanguageCode.en, value: 'Review rating' }],
    //             public: true,
    //             nullable: true,
    //             type: 'float',
    //             ui: { component: 'star-rating-form-input' },
    //         },
    //         {
    //             name: 'reviewCount',
    //             label: [{ languageCode: LanguageCode.en, value: 'Review count' }],
    //             public: true,
    //             defaultValue: 0,
    //             type: 'float',
    //             ui: { component: 'review-count-link' },
    //         },
    //         {
    //             name: 'featuredReview',
    //             label: [{ languageCode: LanguageCode.en, value: 'Featured review' }],
    //             public: true,
    //             type: 'relation',
    //             entity: ProductReview,
    //             ui: { component: 'review-selector-form-input' },
    //         }
    //     ]
    // },
    importExportOptions: {
        importAssetsDir: path.join(__dirname, '..', 'fixtures/assets'),
    },
});
