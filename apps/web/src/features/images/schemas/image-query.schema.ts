import { z } from "zod";
import { basePaginationQuerySchema } from "@/common/schemas/paginationQuery.schema";
import { createSortingQuerySchema } from "@/common/schemas/query-primitives.schema";
import {
  DEFAULT_IMAGE_ORDER_BY,
  ORDER_BY_IMAGES,
} from "@/common/constants/pagination.constants";

export const imagesQuerySchema = z.object({
  ...basePaginationQuerySchema.shape,
  ...createSortingQuerySchema(ORDER_BY_IMAGES, DEFAULT_IMAGE_ORDER_BY).shape,
});
export type ImagesQuery = z.infer<typeof imagesQuerySchema>;
export type InputImagesQuery = Partial<ImagesQuery>;
