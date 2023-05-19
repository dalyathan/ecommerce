import { PermissionDefinition } from "@etech/core";

export const readCompanyInfoPermissionDefinition = new PermissionDefinition({
    name: 'ReadCompanyInfo',
    description: 'Allows reading CompanyInfo'
  });

  export const updateCompanyInfoPermissionDefinition = new PermissionDefinition({
    name: 'UpdateCompanyInfo',
    description: 'Allows updating CompanyInfo'
  });