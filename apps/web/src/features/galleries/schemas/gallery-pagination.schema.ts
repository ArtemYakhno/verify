import { z } from "zod";
import { galleryListItemSchema } from "./gallery-base.schema";

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const paginatedGalleriesSchema = z.object({
  data: z.array(galleryListItemSchema),
  meta: paginationMetaSchema,
});

export type PaginatedGalleries = z.infer<typeof paginatedGalleriesSchema>;