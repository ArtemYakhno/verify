import { z } from "zod";
import { galleryDescriptionSchema, galleryTitleSchema } from "./gallery-base.schema";


export const createGallerySchema = z.object({
  title: galleryTitleSchema,
  description: galleryDescriptionSchema.optional(),
});

export type CreateGalleryValues = z.infer<typeof createGallerySchema>;

export const updateGallerySchema = createGallerySchema.partial();

export type UpdateGalleryValues = z.infer<typeof updateGallerySchema>;