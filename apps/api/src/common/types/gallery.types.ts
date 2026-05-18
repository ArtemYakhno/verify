import { Prisma } from '../../../generated/prisma/client';

const baseGallerySelect = {
  id: true,
  title: true,
  description: true,
  userId: true,
  _count: {
    select: { images: true },
  },
} satisfies Prisma.GallerySelect;

export const galleryListSelect = {
  ...baseGallerySelect,
  images: {
    select: {
      id: true,
      path: true,
    },
    orderBy: { createdAt: 'desc' as const },
    take: 8,
  },
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
