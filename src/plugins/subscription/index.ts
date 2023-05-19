import { PermissionDefinition } from "@etech/core";

export const readSubscriptionsPermissionDefinition = new PermissionDefinition({
    name: 'ReadSubscriptions',
    description: 'Allows reading subscriptions'
  });

  export const createSubscriptionsPermissionDefinition = new PermissionDefinition({
    name: 'CreateSubscriptions',
    description: 'Allows creating subscriptions'
  });

  export const deleteSubscriptionsPermissionDefinition = new PermissionDefinition({
    name: 'DeleteSubscriptions',
    description: 'Allows deleting subscriptions'
  });

  export const updateSubscriptionsPermissionDefinition = new PermissionDefinition({
    name: 'UpdateSubscriptions',
    description: 'Allows updating subscriptions'
  });