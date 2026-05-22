import { z } from "zod";
import { basePaginationQuerySchema } from "@/common/schemas/paginationQuery.schema";
import { createSortingQuerySchema } from "@/common/schemas/sorting.schema";
import { ORDER_BY_IMAGES } from "@/common/constants/pagination.constants";

export const imagesQuerySchema = z.object({
  ...basePaginationQuerySchema.shape,
  ...createSortingQuerySchema(ORDER_BY_IMAGES).shape,
});
export type ImagesQuery = z.infer<typeof imagesQuerySchema>;
