import { Prisma } from '../../generated/prisma/client';

const baseGallerySelect = {
  id: true,
  title: true,
  description: true,
  userId: true,
} satisfies Prisma.GallerySelect;

export const galleryListSelect = {
  ...baseGallerySelect,
} satisfies Prisma.GallerySelect;

export const galleryDetailSelect = {
  ...baseGallerySelect,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GallerySelect;

export type GalleryList = Prisma.GalleryGetPayload<{
  select: typeof galleryListSelect;
}>;

export type GalleryDetail = Prisma.GalleryGetPayload<{
  select: typeof galleryDetailSelect;
}>;
