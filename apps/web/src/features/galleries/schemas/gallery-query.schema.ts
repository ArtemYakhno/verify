import { z } from "zod";
import { ORDER_BY_GALLERIES } from "@/common/constants/pagination.constants";
import { basePaginationQuerySchema } from "@/common/schemas/paginationQuery.schema";
import { createSortingQuerySchema } from "@/common/schemas/sorting.schema";

export const galleriesQuerySchema = z.object({
  ...basePaginationQuerySchema.shape,
  ...createSortingQuerySchema(ORDER_BY_GALLERIES).shape,
});
export type GalleriesQuery = z.infer<typeof galleriesQuerySchema>;
