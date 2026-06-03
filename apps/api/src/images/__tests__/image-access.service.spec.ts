import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ImageAccessService } from '../image-access.service';
import { ImagesService } from '../images.service';
import { IMAGE_MESSAGES } from '../../common/constants/messages.constants';
import { Role } from '../../../generated/prisma/client';
import { makeUser } from '../../common/utils/test.util';

const mockImagesService = {
  findById: jest.fn(),
};

const makeImage = (galleryUserId: number) => ({
  id: 10,
  url: 'https://cdn.example.com/img.jpg',
  gallery: { id: 1, userId: galleryUserId },
});

describe('ImageAccessService', () => {
  let service: ImageAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageAccessService,
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile();

    service = module.get<ImageAccessService>(ImageAccessService);
    jest.clearAllMocks();
  });

  describe('getAccessibleImageOrThrow', () => {
    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      mockImagesService.findById.mockResolvedValue(makeImage(99));
      const user = makeUser({ id: 1, role: Role.USER });

      await expect(service.getAccessibleImageOrThrow(10, user)).rejects.toThrow(
        new ForbiddenException(IMAGE_MESSAGES.FORBIDDEN),
      );
    });

    it('should return image if user owns the gallery', async () => {
      const image = makeImage(1);
      mockImagesService.findById.mockResolvedValue(image);
      const user = makeUser({ id: 1, role: Role.USER });

      const result = await service.getAccessibleImageOrThrow(10, user);

      expect(result).toEqual(image);
    });

    it('should return image if user is ADMIN even if not gallery owner', async () => {
      const image = makeImage(99);
      mockImagesService.findById.mockResolvedValue(image);
      const admin = makeUser({ id: 1, role: Role.ADMIN });

      const result = await service.getAccessibleImageOrThrow(10, admin);

      expect(result).toEqual(image);
    });

    it('should call findById with correct imageId and state', async () => {
      mockImagesService.findById.mockResolvedValue(makeImage(1));
      const user = makeUser();

      await service.getAccessibleImageOrThrow(10, user, 'deleted');

      expect(mockImagesService.findById).toHaveBeenCalledWith(10, 'deleted');
    });

    it('should use active state by default', async () => {
      mockImagesService.findById.mockResolvedValue(makeImage(1));
      const user = makeUser();

      await service.getAccessibleImageOrThrow(10, user);

      expect(mockImagesService.findById).toHaveBeenCalledWith(10, 'active');
    });

    it('should propagate exceptions thrown by findById', async () => {
      const error = new Error('DB error');
      mockImagesService.findById.mockRejectedValue(error);
      const user = makeUser();

      await expect(service.getAccessibleImageOrThrow(10, user)).rejects.toThrow(
        error,
      );
    });
  });
});
