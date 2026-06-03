/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { GalleryAccessService } from '../../galleries/gallery-access.service';
import { GalleryCountersService } from '../../galleries/gallery-counters.service';
import { MediaCleanupService } from '../../common/services/media-cleanup.service';
import { IMAGE_MESSAGES } from '../../common/constants/messages.constants';
import { DeletionReason } from '../../../generated/prisma/client';
import { makeGallery, makeImage, makeUser } from '../../common/utils/test.util';

const mockTx = {
  image: {
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  gallery: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrisma = {
  image: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  gallery: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockCloudinary = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  downloadImageBuffer: jest.fn(),
};

const mockGalleryAccess = {
  getAccessibleGalleryOrThrow: jest.fn(),
};

const mockCounters = {
  changeImagesCount: jest.fn(),
  resetImagesCount: jest.fn(),
};

const mockMediaCleanup = {
  deleteCloudinaryImages: jest.fn(),
};

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
        { provide: GalleryAccessService, useValue: mockGalleryAccess },
        { provide: GalleryCountersService, useValue: mockCounters },
        { provide: MediaCleanupService, useValue: mockMediaCleanup },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should throw NotFoundException if image not found', async () => {
      mockPrisma.image.findFirst.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        new NotFoundException(IMAGE_MESSAGES.NOT_FOUND(99)),
      );
    });

    it('should return image when found', async () => {
      const image = makeImage();
      mockPrisma.image.findFirst.mockResolvedValue(image);

      const result = await service.findById(10);

      expect(result).toEqual(image);
    });

    it('should query with deletedAt: null for active state', async () => {
      mockPrisma.image.findFirst.mockResolvedValue(makeImage());

      await service.findById(10, 'active');

      expect(mockPrisma.image.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should query with deletedAt: { not: null } for deleted state', async () => {
      mockPrisma.image.findFirst.mockResolvedValue(makeImage());

      await service.findById(10, 'deleted');

      expect(mockPrisma.image.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: { not: null } }),
        }),
      );
    });
  });

  describe('findPartByGallery', () => {
    it('should paginate images in gallery', async () => {
      const images = [makeImage(), makeImage()];
      mockPrisma.$transaction.mockResolvedValue([images, 2]);

      const result = await service.findPartByGallery(1, {
        page: 1,
        perPage: 10,
        orderDir: 'desc',
      } as never);

      expect(result.meta).toMatchObject({
        total: 2,
        page: 1,
        perPage: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(mockPrisma.image.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ galleryId: 1 }),
        }),
      );
    });
  });

  describe('findAllByGallery', () => {
    it('should return active images ordered by createdAt desc', async () => {
      mockPrisma.image.findMany.mockResolvedValue([makeImage()]);

      await service.findAllByGallery(1);

      expect(mockPrisma.image.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ galleryId: 1 }),
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findDeletedByGallery', () => {
    it('should return deleted images ordered by deletedAt desc', async () => {
      mockPrisma.image.findMany.mockResolvedValue([makeImage()]);

      await service.findDeletedByGallery(1);

      expect(mockPrisma.image.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            galleryId: 1,
            deletedAt: { not: null },
          }),
          orderBy: { deletedAt: 'desc' },
        }),
      );
    });
  });

  describe('uploadImage', () => {
    const file = {
      buffer: Buffer.from('img'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('should upload to cloudinary and create image record in transaction', async () => {
      const gallery = makeGallery();
      const created = makeImage();

      mockCloudinary.uploadImage.mockResolvedValue({
        secure_url: 'https://cdn.example.com/photo.jpg',
        public_id: 'cloud_id_123',
      });

      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.create.mockResolvedValue(created);
      mockCounters.changeImagesCount.mockResolvedValue(undefined);

      const result = await service.uploadImage(gallery, file, {
        name: 'Test',
        comment: null,
      });

      expect(mockCloudinary.uploadImage).toHaveBeenCalledWith(
        file.buffer,
        file.originalname,
      );
      expect(mockTx.image.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            path: 'https://cdn.example.com/photo.jpg',
            cloudinaryId: 'cloud_id_123',
            originalFilename: file.originalname,
            name: 'Test',
            comment: null,
            galleryId: gallery.id,
          }),
        }),
      );
      expect(mockCounters.changeImagesCount).toHaveBeenCalledWith(
        mockTx,
        gallery.id,
        1,
      );
      expect(result).toEqual(created);
    });

    it('should cleanup uploaded cloudinary asset and rethrow if transaction fails', async () => {
      const gallery = makeGallery();
      const error = new Error('DB failed');

      mockCloudinary.uploadImage.mockResolvedValue({
        secure_url: 'https://cdn.example.com/photo.jpg',
        public_id: 'cloud_id_123',
      });
      mockPrisma.$transaction.mockRejectedValue(error);
      mockMediaCleanup.deleteCloudinaryImages.mockResolvedValue(undefined);

      await expect(service.uploadImage(gallery, file, {})).rejects.toThrow(
        error,
      );

      expect(mockMediaCleanup.deleteCloudinaryImages).toHaveBeenCalledWith(
        ['cloud_id_123'],
        {
          scope: 'upload',
          galleryId: gallery.id,
        },
      );
    });

    it('should not call cleanup if cloudinary upload failed', async () => {
      const gallery = makeGallery();
      mockCloudinary.uploadImage.mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadImage(gallery, file, {})).rejects.toThrow(
        'Upload failed',
      );

      expect(mockMediaCleanup.deleteCloudinaryImages).not.toHaveBeenCalled();
    });
  });

  describe('move', () => {
    it('should move image and update counters for active image', async () => {
      const user = makeUser();
      const targetGallery = makeGallery({ id: 2 });
      const image = makeImage({ galleryId: 1, deletedAt: null });
      const moved = makeImage({ galleryId: 2, deletedAt: null });

      mockGalleryAccess.getAccessibleGalleryOrThrow.mockResolvedValue(
        targetGallery,
      );
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.findUnique.mockResolvedValue(image);
      mockCounters.changeImagesCount.mockResolvedValue(undefined);
      mockTx.image.update.mockResolvedValue(moved);

      const result = await service.move(1, 1, { targetGalleryId: 2 }, user);

      expect(
        mockGalleryAccess.getAccessibleGalleryOrThrow,
      ).toHaveBeenCalledWith(2, user);
      expect(mockTx.image.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
      expect(mockCounters.changeImagesCount).toHaveBeenNthCalledWith(
        1,
        mockTx,
        2,
        1,
      );
      expect(mockCounters.changeImagesCount).toHaveBeenNthCalledWith(
        2,
        mockTx,
        1,
        -1,
      );
      expect(mockTx.image.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { galleryId: 2 },
        select: expect.any(Object),
      });
      expect(result).toEqual(moved);
    });

    it('should not update counters for deleted image', async () => {
      const user = makeUser();
      const targetGallery = makeGallery({ id: 2 });
      const image = makeImage({ galleryId: 1, deletedAt: new Date() });
      const moved = makeImage({ galleryId: 2, deletedAt: new Date() });

      mockGalleryAccess.getAccessibleGalleryOrThrow.mockResolvedValue(
        targetGallery,
      );
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.findUnique.mockResolvedValue(image);
      mockTx.image.update.mockResolvedValue(moved);

      const result = await service.move(1, 1, { targetGalleryId: 2 }, user);

      expect(mockCounters.changeImagesCount).not.toHaveBeenCalled();
      expect(result).toEqual(moved);
    });
  });

  describe('copy', () => {
    it('should copy image and increment counter', async () => {
      const user = makeUser();
      const image = makeImage({ galleryId: 1 });
      const targetGallery = makeGallery({ id: 2 });
      const created = makeImage({ galleryId: 2 });

      mockGalleryAccess.getAccessibleGalleryOrThrow.mockResolvedValue(
        targetGallery,
      );
      mockCloudinary.downloadImageBuffer.mockResolvedValue(
        Buffer.from('img buffer'),
      );
      mockCloudinary.uploadImage.mockResolvedValue({
        secure_url: 'https://cdn.example.com/copy.jpg',
        public_id: 'cloud_id_copy',
      });
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.create.mockResolvedValue(created);
      mockCounters.changeImagesCount.mockResolvedValue(undefined);

      const result = await service.copy(image, 1, { targetGalleryId: 2 }, user);

      expect(mockCloudinary.downloadImageBuffer).toHaveBeenCalledWith(
        image.path,
      );
      expect(mockCloudinary.uploadImage).toHaveBeenCalledWith(
        Buffer.from('img buffer'),
        image.originalFilename,
      );
      expect(mockTx.image.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            path: 'https://cdn.example.com/copy.jpg',
            cloudinaryId: 'cloud_id_copy',
            originalFilename: image.originalFilename,
            name: image.name,
            comment: image.comment,
            galleryId: 2,
          }),
        }),
      );
      expect(mockCounters.changeImagesCount).toHaveBeenCalledWith(mockTx, 2, 1);
      expect(result).toEqual(created);
    });

    it('should cleanup uploaded cloudinary asset if transaction fails', async () => {
      const user = makeUser();
      const image = makeImage({ galleryId: 1 });
      const targetGallery = makeGallery({ id: 2 });
      const error = new Error('DB failed');

      mockGalleryAccess.getAccessibleGalleryOrThrow.mockResolvedValue(
        targetGallery,
      );
      mockCloudinary.downloadImageBuffer.mockResolvedValue(
        Buffer.from('img buffer'),
      );
      mockCloudinary.uploadImage.mockResolvedValue({
        secure_url: 'https://cdn.example.com/copy.jpg',
        public_id: 'cloud_id_copy',
      });
      mockPrisma.$transaction.mockRejectedValue(error);
      mockMediaCleanup.deleteCloudinaryImages.mockResolvedValue(undefined);

      await expect(
        service.copy(image, 1, { targetGalleryId: 2 }, user),
      ).rejects.toThrow(error);

      expect(mockMediaCleanup.deleteCloudinaryImages).toHaveBeenCalledWith(
        ['cloud_id_copy'],
        {
          scope: 'copy',
          imageId: image.id,
          galleryId: 1,
          targetGalleryId: 2,
        },
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete and decrement counter when count > 0', async () => {
      const image = makeImage();
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 1 });
      mockCounters.changeImagesCount.mockResolvedValue(undefined);

      const result = await service.softDelete(image);

      expect(mockTx.image.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletionReason: DeletionReason.MANUAL,
          }),
        }),
      );
      expect(mockCounters.changeImagesCount).toHaveBeenCalledWith(
        mockTx,
        image.galleryId,
        -1,
      );
      expect(result).toBe(true);
    });

    it('should not decrement counter when updateMany count is 0', async () => {
      const image = makeImage();
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 0 });

      await service.softDelete(image);

      expect(mockCounters.changeImagesCount).not.toHaveBeenCalled();
    });

    it('should use provided tx instead of creating a new transaction', async () => {
      const image = makeImage();
      const externalTx = {
        ...mockTx,
        image: {
          ...mockTx.image,
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      mockCounters.changeImagesCount.mockResolvedValue(undefined);

      await service.softDelete(
        image,
        DeletionReason.MANUAL,
        externalTx as never,
      );

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(externalTx.image.updateMany).toHaveBeenCalled();
    });
  });

  describe('checkMoveCopyConflicts', () => {
    it('should throw ConflictException if source and target gallery are the same', async () => {
      const user = makeUser();

      await expect(service.checkMoveCopyConflicts(1, 1, user)).rejects.toThrow(
        new ConflictException(IMAGE_MESSAGES.SAME_GALLERY),
      );
    });

    it('should return target gallery if no conflicts', async () => {
      const user = makeUser();
      const target = makeGallery({ id: 2 });
      mockGalleryAccess.getAccessibleGalleryOrThrow.mockResolvedValue(target);

      const result = await service.checkMoveCopyConflicts(1, 2, user);

      expect(result).toEqual(target);
      expect(
        mockGalleryAccess.getAccessibleGalleryOrThrow,
      ).toHaveBeenCalledWith(2, user);
    });
  });

  describe('softDeleteAll', () => {
    it('should reset counter when images were deleted', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 5 });
      mockCounters.resetImagesCount.mockResolvedValue(undefined);

      await service.softDeleteAll(1);

      expect(mockCounters.resetImagesCount).toHaveBeenCalledWith(mockTx, 1);
    });

    it('should not reset counter when no images were deleted', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 0 });

      await service.softDeleteAll(1);

      expect(mockCounters.resetImagesCount).not.toHaveBeenCalled();
    });
  });

  describe('purge', () => {
    it('should delete from db and cleanup cloudinary after commit', async () => {
      const image = makeImage({ deletedAt: null });
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.delete.mockResolvedValue(undefined);
      mockCounters.changeImagesCount.mockResolvedValue(undefined);
      mockMediaCleanup.deleteCloudinaryImages.mockResolvedValue(undefined);

      const result = await service.purge(image);

      expect(mockTx.image.delete).toHaveBeenCalledWith({
        where: { id: image.id },
      });
      expect(mockCounters.changeImagesCount).toHaveBeenCalledWith(
        mockTx,
        image.galleryId,
        -1,
      );
      expect(mockMediaCleanup.deleteCloudinaryImages).toHaveBeenCalledWith(
        [image.cloudinaryId],
        {
          scope: 'image',
          imageId: image.id,
          galleryId: image.galleryId,
        },
      );
      expect(result).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore image and increment counter when updateMany count > 0', async () => {
      const image = makeImage({ deletedAt: new Date() });
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 1 });
      mockCounters.changeImagesCount.mockResolvedValue(undefined);

      const result = await service.restore(image);

      expect(mockTx.image.updateMany).toHaveBeenCalledWith({
        where: {
          id: image.id,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });
      expect(mockCounters.changeImagesCount).toHaveBeenCalledWith(
        mockTx,
        image.galleryId,
        1,
      );
      expect(result).toBe(true);
    });

    it('should not increment counter when updateMany count is 0', async () => {
      const image = makeImage({ deletedAt: new Date() });
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.image.updateMany.mockResolvedValue({ count: 0 });

      await service.restore(image);

      expect(mockCounters.changeImagesCount).not.toHaveBeenCalled();
    });
  });
});
