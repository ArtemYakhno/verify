import { z } from "zod";

export const galleryTitleSchema = z
  .string()
  .trim()
  .min(2, "Title must be at least 2 characters")
  .max(50, "Title must be at most 50 characters");

export const galleryDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description must be at most 255 characters");

export const galleryPreviewImageSchema = z.object({
  id: z.number(),
  path: z.url(),
});

export const gallerySchema = z.object({
  id: z.number(),
  title: galleryTitleSchema,
  description: galleryDescriptionSchema.nullable(),
  userId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  imagesCount: z.number(),
});
