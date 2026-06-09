/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GalleriesService } from '../galleries.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GalleryCountersService } from '../gallery-counters.service';
import { ImagesService } from '../../images/images.service';
import { MediaCleanupService } from '../../common/services/media-cleanup.service';
import { GALLERY_MESSAGES } from '../../common/constants/messages.constants';
import { DeletionReason } from '../../../generated/prisma/client';
import { SortDirection } from '../../common/types/sort-direction.types';
import { GalleryOrderBy } from '../types/gallery-order-by.type';

const mockTx = {
  gallery: {
    update: jest.fn(),
    delete: jest.fn(),
  },
  image: {
    updateMany: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockPrisma = {
  gallery: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  image: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockCounters = {
  setImagesCount: jest.fn(),
  changeImagesCount: jest.fn(),
  resetImagesCount: jest.fn(),
};

const mockImagesService = {
  softDeleteAll: jest.fn(),
};

const mockMediaCleanup = {
  deleteCloudinaryImages: jest.fn(),
};

describe('GalleriesService', () => {
  let service: GalleriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleriesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GalleryCountersService, useValue: mockCounters },
        { provide: ImagesService, useValue: mockImagesService },
        { provide: MediaCleanupService, useValue: mockMediaCleanup },
      ],
    }).compile();

    service = module.get<GalleriesService>(GalleriesService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should throw NotFoundException if gallery not found', async () => {
      mockPrisma.gallery.findFirst.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(1)),
      );
    });

    it('should return gallery when found', async () => {
      const gallery = { id: 1, userId: 1 };
      mockPrisma.gallery.findFirst.mockResolvedValue(gallery);

      const result = await service.findById(1);

      expect(result).toEqual(gallery);
    });

    it('should query with deletedAt: null for active state', async () => {
      mockPrisma.gallery.findFirst.mockResolvedValue({ id: 1 });

      await service.findById(1, 'active');

      expect(mockPrisma.gallery.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should query with deletedAt: { not: null } for deleted state', async () => {
      mockPrisma.gallery.findFirst.mockResolvedValue({ id: 1 });

      await service.findById(1, 'deleted');

      expect(mockPrisma.gallery.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: { not: null } }),
        }),
      );
    });

    it('should query with only id for any state', async () => {
      mockPrisma.gallery.findFirst.mockResolvedValue({ id: 1 });

      await service.findById(1, 'any');

      expect(mockPrisma.gallery.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        }),
      );
    });
  });

  describe('restore', () => {
    it('should restore gallery and inherited images, update counter', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.gallery.update.mockResolvedValue({});
      mockTx.image.updateMany.mockResolvedValue({ count: 3 });
      mockTx.image.count.mockResolvedValue(3);
      mockCounters.setImagesCount.mockResolvedValue(undefined);

      const result = await service.restore(1);

      expect(mockTx.gallery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { deletedAt: null, deletionReason: null },
        }),
      );

      expect(mockTx.image.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            galleryId: 1,
            deletionReason: DeletionReason.INHERIT,
            deletedAt: { not: null },
          }),
          data: { deletedAt: null, deletionReason: null },
        }),
      );

      expect(mockTx.image.count).toHaveBeenCalledWith({
        where: {
          galleryId: 1,
          deletedAt: null,
        },
      });

      expect(mockCounters.setImagesCount).toHaveBeenCalledWith(mockTx, 1, 3);
      expect(result).toBe(true);
    });

    it('should use provided tx instead of creating a new transaction', async () => {
      const externalTx = {
        gallery: { update: jest.fn().mockResolvedValue({}) },
        image: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          count: jest.fn().mockResolvedValue(0),
        },
      };

      mockCounters.setImagesCount.mockResolvedValue(undefined);

      await service.restore(1, externalTx as never);

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(externalTx.gallery.update).toHaveBeenCalled();
    });

    it('should set imagesCount to 0 if no active images after restore', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.gallery.update.mockResolvedValue({});
      mockTx.image.updateMany.mockResolvedValue({ count: 0 });
      mockTx.image.count.mockResolvedValue(0);
      mockCounters.setImagesCount.mockResolvedValue(undefined);

      await service.restore(1);

      expect(mockCounters.setImagesCount).toHaveBeenCalledWith(mockTx, 1, 0);
    });

    it('should set imagesCount from actual active images count, not restored rows count', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
      mockTx.gallery.update.mockResolvedValue({});
      mockTx.image.updateMany.mockResolvedValue({ count: 5 });
      mockTx.image.count.mockResolvedValue(3);
      mockCounters.setImagesCount.mockResolvedValue(undefined);

      await service.restore(1);

      expect(mockCounters.setImagesCount).toHaveBeenCalledWith(mockTx, 1, 3);
    });
  });

  describe('buildFindAllWhere', () => {
    const baseQuery = {
      page: 1,
      perPage: 10,
      orderBy: 'createdAt' as GalleryOrderBy,
      orderDir: 'desc' as SortDirection,
    };

    beforeEach(() => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);
    });

    it('should include deletedAt: null by default', async () => {
      await service.findPart(baseQuery);

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({ deletedAt: null });
    });

    it('should add title filter when search is provided', async () => {
      await service.findPart({ ...baseQuery, search: 'vacation' });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({
        title: { contains: 'vacation', mode: 'insensitive' },
      });
    });

    it('should add createdAt.gte when createdFrom is provided', async () => {
      const from = new Date('2024-01-01');
      await service.findPart({ ...baseQuery, createdFrom: from });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({ createdAt: { gte: from } });
    });

    it('should add createdAt.lte set to end of day when createdTo is provided', async () => {
      const to = new Date('2024-06-15');
      await service.findPart({ ...baseQuery, createdTo: to });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: { createdAt: { lte: Date } } },
      ];

      const lte = findManyArgs.where.createdAt.lte;
      expect(lte.getHours()).toBe(23);
      expect(lte.getMinutes()).toBe(59);
      expect(lte.getSeconds()).toBe(59);
      expect(lte.getMilliseconds()).toBe(999);
    });

    it('should add imagesCount.gte when minImages is provided', async () => {
      await service.findPart({ ...baseQuery, minImages: 5 });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({ imagesCount: { gte: 5 } });
    });

    it('should add imagesCount.lte when maxImages is provided', async () => {
      await service.findPart({ ...baseQuery, maxImages: 20 });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({ imagesCount: { lte: 20 } });
    });

    it('should add both imagesCount bounds when min and max are provided', async () => {
      await service.findPart({ ...baseQuery, minImages: 3, maxImages: 15 });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({
        imagesCount: { gte: 3, lte: 15 },
      });
    });

    it('should not add imagesCount filter when neither min nor max provided', async () => {
      await service.findPart(baseQuery);

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).not.toHaveProperty('imagesCount');
    });

    it('should combine multiple filters together', async () => {
      const from = new Date('2024-01-01');

      await service.findPart({
        ...baseQuery,
        search: 'trip',
        createdFrom: from,
        minImages: 1,
        maxImages: 50,
      });

      const [findManyArgs] = mockPrisma.gallery.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];

      expect(findManyArgs.where).toMatchObject({
        deletedAt: null,
        title: { contains: 'trip', mode: 'insensitive' },
        createdAt: { gte: from },
        imagesCount: { gte: 1, lte: 50 },
      });
    });
  });

  describe('purge', () => {
    it('should run purge in transaction and cleanup cloudinary ids after commit when tx is not provided', async () => {
      const imageRows = [
        { cloudinaryId: 'uploads/a' },
        { cloudinaryId: 'uploads/b' },
        { cloudinaryId: 'uploads/a' },
      ];

      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<string[]>) => fn(mockTx),
      );
      mockTx.image.findMany.mockResolvedValue(imageRows);
      mockTx.gallery.delete.mockResolvedValue({});
      mockMediaCleanup.deleteCloudinaryImages.mockResolvedValue(undefined);

      await service.purge(1);

      expect(mockTx.image.findMany).toHaveBeenCalledWith({
        where: { galleryId: 1 },
        select: { cloudinaryId: true },
      });

      expect(mockTx.gallery.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockMediaCleanup.deleteCloudinaryImages).toHaveBeenCalledWith(
        ['uploads/a', 'uploads/b', 'uploads/a'],
        expect.objectContaining({
          scope: 'gallery',
          galleryId: 1,
        }),
      );
    });

    it('should return cloudinary ids and not trigger cleanup immediately when external tx is provided', async () => {
      const externalTx = {
        gallery: { delete: jest.fn().mockResolvedValue({}) },
        image: {
          findMany: jest
            .fn()
            .mockResolvedValue([
              { cloudinaryId: 'uploads/a' },
              { cloudinaryId: 'uploads/b' },
            ]),
        },
      };

      const result = await service.purge(1, externalTx as never);

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(externalTx.gallery.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockMediaCleanup.deleteCloudinaryImages).not.toHaveBeenCalled();
      expect(result).toEqual(['uploads/a', 'uploads/b']);
    });
  });
});
