import { Test, TestingModule } from '@nestjs/testing';
import { MediaCleanupService, CleanupContext } from '../media-cleanup.service';
import { CloudinaryService } from '../cloudinary.service';

const mockCloudinaryService = {
  deleteImage: jest.fn(),
};

describe('MediaCleanupService', () => {
  let service: MediaCleanupService;

  const context: CleanupContext = {
    scope: 'gallery',
    galleryId: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaCleanupService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<MediaCleanupService>(MediaCleanupService);
    jest.clearAllMocks();
  });

  it('should skip cleanup when there are no valid cloudinary ids', async () => {
    await expect(
      service.deleteCloudinaryImages([], context),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
  });

  it('should deduplicate cloudinary ids before deletion', async () => {
    mockCloudinaryService.deleteImage
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/a',
      })
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/b',
      });

    await expect(
      service.deleteCloudinaryImages(
        ['uploads/a', 'uploads/a', 'uploads/b'],
        context,
      ),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
    expect(mockCloudinaryService.deleteImage).toHaveBeenNthCalledWith(
      1,
      'uploads/a',
    );
    expect(mockCloudinaryService.deleteImage).toHaveBeenNthCalledWith(
      2,
      'uploads/b',
    );
  });

  it('should resolve when all images are deleted successfully', async () => {
    mockCloudinaryService.deleteImage
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/a',
      })
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/b',
      });

    await expect(
      service.deleteCloudinaryImages(['uploads/a', 'uploads/b'], context),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('should resolve when some images are not found', async () => {
    mockCloudinaryService.deleteImage
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/a',
      })
      .mockResolvedValueOnce({
        status: 'not_found',
        publicId: 'uploads/missing',
      });

    await expect(
      service.deleteCloudinaryImages(['uploads/a', 'uploads/missing'], context),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('should resolve when some deletions fail', async () => {
    mockCloudinaryService.deleteImage
      .mockResolvedValueOnce({
        status: 'deleted',
        publicId: 'uploads/a',
      })
      .mockRejectedValueOnce(new Error('Cloudinary failed'));

    await expect(
      service.deleteCloudinaryImages(['uploads/a', 'uploads/b'], context),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
  });

  it('should resolve when there are both not_found and rejected results', async () => {
    mockCloudinaryService.deleteImage
      .mockResolvedValueOnce({
        status: 'not_found',
        publicId: 'uploads/missing',
      })
      .mockRejectedValueOnce(new Error('Cloudinary failed'));

    await expect(
      service.deleteCloudinaryImages(
        ['uploads/missing', 'uploads/broken'],
        context,
      ),
    ).resolves.toBeUndefined();

    expect(mockCloudinaryService.deleteImage).toHaveBeenCalledTimes(2);
  });
});
