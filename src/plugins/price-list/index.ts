import { PermissionDefinition } from "@etech/core";

export const readPriceListsPermissionDefinition = new PermissionDefinition({
    name: 'ReadPriceLists',
    description: 'Allows reading PriceLists'
  });

  export const createPriceListsPermissionDefinition = new PermissionDefinition({
    name: 'CreatePriceLists',
    description: 'Allows creating PriceLists'
  });

  export const deletePriceListsPermissionDefinition = new PermissionDefinition({
    name: 'TogglePriceLists',
    description: 'Allows enabling and disabling PriceLists'
  });

  export const updatePriceListsPermissionDefinition = new PermissionDefinition({
    name: 'UpdatePriceLists',
    description: 'Allows updating PriceLists'
  });