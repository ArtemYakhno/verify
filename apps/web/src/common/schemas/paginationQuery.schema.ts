import { z } from "zod";

export const basePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  perPage: z.coerce.number().int().min(1).max(50).catch(12),
});
