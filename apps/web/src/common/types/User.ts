import type z from "zod";
import type { userSchema } from "../schemas/user.schemas";

export type User = z.infer<typeof userSchema>;
