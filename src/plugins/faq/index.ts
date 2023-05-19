import { PermissionDefinition } from "@etech/core";

export const readFAQsPermissionDefinition = new PermissionDefinition({
    name: 'ReadFAQs',
    description: 'Allows reading FAQs'
  });

  export const createFAQsPermissionDefinition = new PermissionDefinition({
    name: 'CreateFAQs',
    description: 'Allows creating FAQs'
  });

  export const deleteFAQsPermissionDefinition = new PermissionDefinition({
    name: 'DeleteFAQs',
    description: 'Allows deleting FAQs'
  });

  export const updateFAQsPermissionDefinition = new PermissionDefinition({
    name: 'UpdateFAQs',
    description: 'Allows updating FAQs'
  });