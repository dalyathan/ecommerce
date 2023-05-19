import { PermissionDefinition } from "@etech/core";

export const readReviewsPermissionDefinition = new PermissionDefinition({
  name: 'ReadReviews',
  description: 'Allows reading reviews'
});
export const updateReviewsPermissionDefinition = new PermissionDefinition({
  name: 'UpdateReviews',
  description: 'Allows updating reviews'
});