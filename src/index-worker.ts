import { bootstrapWorker,mergeConfig } from '@etech/core';
import { config } from './etech-config';

bootstrapWorker(config)
.then(worker => worker.startJobQueue())
.catch(err => {
    console.log(err);
});
