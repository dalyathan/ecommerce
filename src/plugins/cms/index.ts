import { PermissionDefinition } from "@etech/core";

export const readCmsPermissionDefinition = new PermissionDefinition({
    name: 'ReadCms',
    description: 'Allows reading Cms'
  });

  export const updateCmsPermissionDefinition = new PermissionDefinition({
    name: 'UpdateCms',
    description: 'Allows updating Cms'
  });