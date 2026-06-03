import { z } from "zod";

export const imageNameSchema = z
  .string()
  .trim()
  .max(100, "Name must be at most 100 characters");

export const imageCommentSchema = z
  .string()
  .trim()
  .max(100, "Comment must be at most 100 characters");

export const imageSchema = z.object({
  id: z.number(),
  path: z.url(),
  galleryId: z.number(),
  originalFilename: z.string(),
  name: imageNameSchema.nullable(),
  comment: imageCommentSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
