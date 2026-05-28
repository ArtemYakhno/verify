import { z } from "zod";
import {
  galleryDescriptionSchema,
  galleryTitleSchema,
} from "./gallery-base.schema";
import {
  updateImagesSchema,
  uploadImagesSchema,
} from "@/features/images/schemas/image-request.schema";
import { nullableNormalizedSchema } from "@/common/schemas/primitives.schema";

export const fieldsGallerySchema = z.object({
  title: galleryTitleSchema,
  description: nullableNormalizedSchema(galleryDescriptionSchema),
});

export const updateFieldsGallerySchema = fieldsGallerySchema.partial();

export const createGallerySchema = uploadImagesSchema.extend({
  gallery: fieldsGallerySchema,
});

export const updateGallerySchema = z.object({
  gallery: updateFieldsGallerySchema,
  images: updateImagesSchema,
  deletedImageIds: z.array(z.number()),
});

export type FieldsGalleryValues = z.infer<typeof fieldsGallerySchema>;
export type UpdateFieldsGalleryValues = z.infer<
  typeof updateFieldsGallerySchema
>;
export type CreateGalleryValues = z.infer<typeof createGallerySchema>;
export type UpdateGalleryValues = z.infer<typeof updateGallerySchema>;
