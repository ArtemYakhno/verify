/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GalleryAccessService } from '../gallery-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GALLERY_MESSAGES } from '../../common/constants/messages.constants';
import { Role } from '../../../generated/prisma/client';
import { makeUser } from '../../common/utils/test.util';

const mockPrismaFns = {
  gallery: { findFirst: jest.fn() },
};

const mockPrisma = mockPrismaFns as unknown as PrismaService;

describe('GalleryAccessService', () => {
  let service: GalleryAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryAccessService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GalleryAccessService>(GalleryAccessService);
    jest.clearAllMocks();
  });

  describe('getAccessibleGalleryOrThrow', () => {
    it('should throw NotFoundException if gallery not found', async () => {
      mockPrismaFns.gallery.findFirst.mockResolvedValue(null);
      const user = makeUser();

      await expect(
        service.getAccessibleGalleryOrThrow(1, user),
      ).rejects.toThrow(new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(1)));
    });

    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      mockPrismaFns.gallery.findFirst.mockResolvedValue({ id: 1, userId: 99 });
      const user = makeUser({ id: 1, role: Role.USER });

      await expect(
        service.getAccessibleGalleryOrThrow(1, user),
      ).rejects.toThrow(new ForbiddenException(GALLERY_MESSAGES.FORBIDDEN));
    });

    it('should return gallery if user is the owner', async () => {
      const gallery = { id: 1, userId: 1 };
      mockPrismaFns.gallery.findFirst.mockResolvedValue(gallery);
      const user = makeUser({ id: 1, role: Role.USER });

      const result = await service.getAccessibleGalleryOrThrow(1, user);

      expect(result).toEqual(gallery);
    });

    it('should return gallery if user is ADMIN even if not owner', async () => {
      const gallery = { id: 1, userId: 99 };
      mockPrismaFns.gallery.findFirst.mockResolvedValue(gallery);
      const admin = makeUser({ id: 1, role: Role.ADMIN });

      const result = await service.getAccessibleGalleryOrThrow(1, admin);

      expect(result).toEqual(gallery);
    });

    it('should query with deletedAt: null for active state', async () => {
      mockPrismaFns.gallery.findFirst.mockResolvedValue({ id: 1, userId: 1 });
      const user = makeUser();

      await service.getAccessibleGalleryOrThrow(1, user, 'active');

      expect(mockPrismaFns.gallery.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });
});
