import { PermissionDefinition } from "@etech/core";

export const deleteQuotePermissionDefinition = new PermissionDefinition({
    name: 'DeleteQuotes',
    description: 'Allows deletion of quote'
  });

  export const readQuotesPermissionDefinition = new PermissionDefinition({
    name: 'ReadQuotes',
    description: 'Allows reading quote'
  });

  export const updateQuotesPermissionDefinition = new PermissionDefinition({
    name: 'UpdateQuotes',
    description: 'Allows approving of quotes'
  });