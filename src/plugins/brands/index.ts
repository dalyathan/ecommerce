import { CrudPermissionDefinition } from "@etech/core";

export const  brandsPermission= new CrudPermissionDefinition('Brands',
operation=>`Grants Permission to Brands`);

export const industryPermission= new CrudPermissionDefinition('Industries',
                operation=>`Grants Permission to Industries`)