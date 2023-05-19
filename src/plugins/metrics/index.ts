import { PermissionDefinition } from "@etech/core";

export const readMetricsPermissionDefinition = new PermissionDefinition({
    name: 'ReadMetrics',
    description: 'Allows reading metrics on admin dashboard'
  });
export * from './MetricsPlugin';
export * from './api/strategies';
export * from './api/metrics.service';
export * from './api/metrics.resolver';
export * from './ui/generated/graphql';
