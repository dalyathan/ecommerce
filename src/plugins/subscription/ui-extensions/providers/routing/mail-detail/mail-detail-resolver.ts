import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, BaseEntityResolver } from '@etech/admin-ui/package/core';
import { take } from 'rxjs/operators';
import { GET_EMAIL } from './mail-detail-resolver.graphql';

import { 
  GetEmailQuery,
  SubscribedEmailsFragment,
  GetEmailQueryVariables
} from '../../../generated-types';

@Injectable()
export default class MailDetailResolver extends BaseEntityResolver<
  SubscribedEmailsFragment
> {
  constructor(router: Router, dataService: DataService) {
    super(
      router,
      {
        __typename: 'Email',
        id: '',
		email:'',
		createdAt: '',
		updatedAt: ''
      },
      (id) =>
        dataService.query<GetEmailQuery, GetEmailQueryVariables>(GET_EMAIL, {
            id: id
        })
        .mapStream((data) => data.SubscriptionEmail)
    );
  }
}

