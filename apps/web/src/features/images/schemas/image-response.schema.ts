import { z } from "zod";
import { imageSchema } from "./image-base.schema";
import { paginationMetaSchema } from "@/common/schemas/pagination.schema";

export const galleryImagesSchema = z.array(imageSchema);

export const paginatedImagesSchema = z.object({
  data: galleryImagesSchema,
  meta: paginationMetaSchema,
});

export type Image = z.infer<typeof imageSchema>;
export type PaginatedImages = z.infer<typeof paginatedImagesSchema>;
