import { Role } from '../../../generated/prisma/enums';
import { Gallery } from '../types/gallery.types';
import { ImageInternal } from '../types/image.types';
import { User } from '../types/user.types';

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'user@test.com',
  role: Role.USER,
  firstname: 'John',
  lastname: 'Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makeGallery = (overrides = {}): Gallery =>
  ({
    id: 1,
    userId: 1,
    title: 'Test Gallery',
    description: 'A gallery for testing',
    imagesCount: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Gallery;

export const makeImage = (overrides = {}): ImageInternal =>
  ({
    id: 10,
    galleryId: 1,
    path: 'https://cdn.example.com/img.jpg',
    cloudinaryId: 'cloud_id_123',
    originalFilename: 'photo.jpg',
    name: null,
    comment: null,
    deletedAt: null,
    ...overrides,
  }) as ImageInternal;
