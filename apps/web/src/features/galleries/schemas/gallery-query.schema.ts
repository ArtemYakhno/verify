import { z } from "zod";
import {
  ORDER_BY_GALLERIES,
  ORDER_DIR,
} from "@/common/constants/pagination.constants";

export const galleriesQuerySchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  perPage: z.number().int().min(1).max(50).default(10).optional(),
  orderBy: z.enum(ORDER_BY_GALLERIES).default("createdAt").optional(),
  orderDir: z.enum(ORDER_DIR).default("desc").optional(),
});

export type GalleriesQuery = z.infer<typeof galleriesQuerySchema>;