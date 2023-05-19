import { CrudPermissionDefinition, PermissionDefinition } from "@etech/core";

export const contactUsPermissionDefinition = new CrudPermissionDefinition(
    'ContactUs',
    operation=> 'Grants Permission to ContactUs'
  );