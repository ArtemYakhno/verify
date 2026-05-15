import { Prisma } from '../../generated/prisma/client';

export const imageSelect = {
  id: true,
  path: true,
  galleryId: true,
  originalFilename: true,
  name: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ImageSelect;

export const imageInternalSelect = {
  ...imageSelect,
  cloudinaryId: true,
} satisfies Prisma.ImageSelect;

export type Image = Prisma.ImageGetPayload<{
  select: typeof imageSelect;
}>;
export type ImageInternal = Prisma.ImageGetPayload<{
  select: typeof imageInternalSelect;
}>;
