import z from "zod";

const NAME_REGEX = /^[\p{L}'-]+(\s[\p{L}'-]+)*$/u;

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .max(32, "Maximum 32 characters")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Minimum 2 characters")
  .max(50, "Maximum 50 characters")
  .regex(NAME_REGEX, "Must contain letters only");

export function nullableNormalizedSchema(schema: z.ZodString) {
  return z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .pipe(schema.nullable());
}
