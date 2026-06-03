import { z } from "zod";
import { nameSchema } from "./primitives.schema";
export const userSchema = z.object({
  id: z.number(),
  firstname: nameSchema,
  lastname: nameSchema,
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
