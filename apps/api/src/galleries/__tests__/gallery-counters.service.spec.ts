import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { GalleryCountersService } from '../gallery-counters.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MAX_IMAGES_PER_GALLERY } from '../../common/constants/limits.constants';
import { Prisma } from '../../../generated/prisma/client';

const mockTxFns = {
  gallery: {
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockTx = mockTxFns as unknown as Prisma.TransactionClient;

describe('GalleryCountersService', () => {
  let service: GalleryCountersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryCountersService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<GalleryCountersService>(GalleryCountersService);
    jest.clearAllMocks();
  });

  describe('changeImagesCount', () => {
    it('should do nothing if diff is 0', async () => {
      await service.changeImagesCount(mockTx, 1, 0);

      expect(mockTxFns.gallery.updateMany).not.toHaveBeenCalled();
      expect(mockTxFns.gallery.update).not.toHaveBeenCalled();
    });

    it('should increment when diff is positive and within max limit', async () => {
      mockTxFns.gallery.updateMany.mockResolvedValue({ count: 1 });

      await service.changeImagesCount(mockTx, 1, 3);

      expect(mockTxFns.gallery.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          imagesCount: {
            lte: MAX_IMAGES_PER_GALLERY - 3,
          },
        },
        data: {
          imagesCount: { increment: 3 },
        },
      });
    });

    it('should decrement when diff is negative and within min limit', async () => {
      mockTxFns.gallery.updateMany.mockResolvedValue({ count: 1 });

      await service.changeImagesCount(mockTx, 1, -2);

      expect(mockTxFns.gallery.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          imagesCount: {
            gte: 2,
          },
        },
        data: {
          imagesCount: { decrement: 2 },
        },
      });
    });

    it('should throw ConflictException when increment exceeds max limit', async () => {
      mockTxFns.gallery.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.changeImagesCount(mockTx, 1, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when decrement goes below zero', async () => {
      mockTxFns.gallery.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.changeImagesCount(mockTx, 1, -1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('setImagesCount', () => {
    it('should set valid count', async () => {
      mockTxFns.gallery.update.mockResolvedValue({});

      await service.setImagesCount(mockTx, 1, 10);

      expect(mockTxFns.gallery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imagesCount: 10 },
      });
    });

    it('should allow boundary value 0', async () => {
      mockTxFns.gallery.update.mockResolvedValue({});

      await service.setImagesCount(mockTx, 1, 0);

      expect(mockTxFns.gallery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imagesCount: 0 },
      });
    });

    it(`should allow boundary value ${MAX_IMAGES_PER_GALLERY}`, async () => {
      mockTxFns.gallery.update.mockResolvedValue({});

      await service.setImagesCount(mockTx, 1, MAX_IMAGES_PER_GALLERY);

      expect(mockTxFns.gallery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imagesCount: MAX_IMAGES_PER_GALLERY },
      });
    });

    it('should throw ConflictException when count is negative', async () => {
      await expect(service.setImagesCount(mockTx, 1, -1)).rejects.toThrow(
        ConflictException,
      );

      expect(mockTxFns.gallery.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when count exceeds max', async () => {
      await expect(
        service.setImagesCount(mockTx, 1, MAX_IMAGES_PER_GALLERY + 1),
      ).rejects.toThrow(ConflictException);

      expect(mockTxFns.gallery.update).not.toHaveBeenCalled();
    });
  });

  describe('resetImagesCount', () => {
    it('should reset imagesCount to 0', async () => {
      mockTxFns.gallery.update.mockResolvedValue({});

      await service.resetImagesCount(mockTx, 1);

      expect(mockTxFns.gallery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { imagesCount: 0 },
      });
    });
  });
});
