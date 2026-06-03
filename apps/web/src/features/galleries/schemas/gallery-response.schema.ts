import { z } from "zod";
import {
  galleryPreviewImageSchema,
  gallerySchema,
} from "./gallery-base.schema";
import { paginationMetaSchema } from "@/common/schemas/pagination.schema";

const galleryListItemSchema = gallerySchema
  .pick({
    id: true,
    title: true,
    description: true,
    userId: true,
    imagesCount: true,
  })
  .extend({
    images: z.array(galleryPreviewImageSchema),
  });

export const paginatedGalleriesSchema = z.object({
  data: galleryListItemSchema.array(),
  meta: paginationMetaSchema,
});

export type GalleryListItem = z.infer<typeof galleryListItemSchema>;
export type PaginatedGalleries = z.infer<typeof paginatedGalleriesSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
