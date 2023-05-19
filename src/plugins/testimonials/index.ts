import { PermissionDefinition } from "@etech/core";

export const readTestimonialsPermissionDefinition = new PermissionDefinition({
    name: 'ReadTestimonials',
    description: 'Allows reading testimonials'
  });

  export const createTestimonialsPermissionDefinition = new PermissionDefinition({
    name: 'CreateTestimonials',
    description: 'Allows creating testimonials'
  });

  export const deleteTestimonialsPermissionDefinition = new PermissionDefinition({
    name: 'DeleteTestimonials',
    description: 'Allows deleting testimonials'
  });

  export const updateTestimonialsPermissionDefinition = new PermissionDefinition({
    name: 'UpdateTestimonials',
    description: 'Allows updating testimonials'
  });