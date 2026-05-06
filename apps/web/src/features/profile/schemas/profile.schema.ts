import { z } from "zod";
import { userSchema } from "@/common/schemas/user.schemas";
import { passwordSchema } from "@/common/schemas/primitives.schema";

export const updateProfileSchema = userSchema.pick({
  firstname: true,
  lastname: true,
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordDto = Omit<ChangePasswordValues, "confirmPassword">;
