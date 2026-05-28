import { z } from "zod";

export const basePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  perPage: z.coerce.number().int().min(1).max(50).default(12).optional(),
});
