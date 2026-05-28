import z from "zod";

export const createSortingQuerySchema = <
  T extends readonly [string, ...string[]],
>(
  orderBy: T,
) =>
  z.object({
    orderBy: z.enum(orderBy).default(orderBy[0]).optional(),
    orderDir: z.enum(["asc", "desc"]).default("desc").optional(),
  });
