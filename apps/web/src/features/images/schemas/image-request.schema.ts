import { z } from "zod";
import { imageCommentSchema, imageNameSchema } from "./image-base.schema";
import {
  ALLOWED_IMAGES_TYPES,
  MAX_FILES,
  MAX_FILE_SIZE,
} from "../constants/image.constants.ts";
import { nullableNormalizedSchema } from "@/common/schemas/primitives.schema.ts";

export const imageFileSchema = z
  .instanceof(File, { message: "Image file is required" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Image must be at most 5 MB",
  })
  .refine(
    (file) =>
      [...ALLOWED_IMAGES_TYPES].includes(
        file.type as (typeof ALLOWED_IMAGES_TYPES)[number],
      ),
    {
      message: `Unsupported image type. Allowed types: ${ALLOWED_IMAGES_TYPES.join(", ")}`,
    },
  );

export const imageMetadataSchema = z.object({
  name: nullableNormalizedSchema(imageNameSchema),
  comment: nullableNormalizedSchema(imageCommentSchema),
});

export const updateImageMetadataSchema = imageMetadataSchema.partial();

export const uploadImageItemSchema = imageMetadataSchema.extend({
  file: imageFileSchema,
});

export const uploadImagesSchema = z.object({
  uploads: uploadImageItemSchema
    .array()
    .max(MAX_FILES, `You can upload at most ${MAX_FILES} images`),
});

export const updateImageItemSchema = z.object({
  id: z.number(),
  path: z.url(),
  ...updateImageMetadataSchema.shape,
});

export const updateImagesSchema = updateImageItemSchema.array();

export type ImageMetadataValues = z.infer<typeof imageMetadataSchema>;
export type UpdateImageMetadataValues = z.infer<typeof updateImageMetadataSchema>;
export type UploadImageItemValues = z.infer<typeof uploadImageItemSchema>;
export type UploadImagesValues = z.infer<typeof uploadImagesSchema>;
export type UpdateImageItemValues = z.infer<typeof updateImageItemSchema>;
export type UpdateImagesValues = z.infer<typeof updateImagesSchema>;

export type ActionImageValues = {
  targetGalleryId: number;
};
