import { z } from "zod";

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;