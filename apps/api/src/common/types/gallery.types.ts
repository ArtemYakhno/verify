import { Prisma } from '../../../generated/prisma/client';

const baseGallerySelect = {
  id: true,
  title: true,
  description: true,
  userId: true,
  imagesCount: true,
} satisfies Prisma.GallerySelect;

export const galleryListSelect = {
  ...baseGallerySelect,
  images: {
    where: { deletedAt: null },
    select: {
      id: true,
      path: true,
    },
    orderBy: { createdAt: 'desc' as const },
    take: 8,
  },
} satisfies Prisma.GallerySelect;

export const gallerySelect = {
  ...baseGallerySelect,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GallerySelect;

export type GalleryList = Prisma.GalleryGetPayload<{
  select: typeof galleryListSelect;
}>;

export type Gallery = Prisma.GalleryGetPayload<{
  select: typeof gallerySelect;
}>;
