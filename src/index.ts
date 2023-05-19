import { bootstrap,bootstrapWorker, JobQueueService } from '@etech/core';
import { config } from './etech-config';

bootstrap(config)
//   .then(app => app.get(JobQueueService).start())
  .catch(err => {
    console.log(err);
  });
