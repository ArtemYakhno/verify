import { nameSchema, passwordSchema } from "@/common/schemas/primitives.schema";
import z from "zod";

export const registerFormSchema = z
  .object({
    firstname: nameSchema,
    lastname: nameSchema,
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterValues = z.infer<typeof registerFormSchema>;
export type RegisterDto = Omit<RegisterValues, "confirmPassword">;
export type LoginValues = z.infer<typeof loginFormSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
});
