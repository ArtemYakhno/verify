import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

export interface CleanupContext {
  scope: 'image' | 'gallery' | 'user' | 'upload' | 'copy';
  userId?: number;
  galleryId?: number;
  imageId?: number;
  targetGalleryId?: number;
}

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async deleteCloudinaryImages(
    cloudinaryIds: string[],
    context: CleanupContext,
  ): Promise<void> {
    const uniqueIds = [...new Set(cloudinaryIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      this.logger.log(
        `Cloudinary cleanup skipped | meta=${JSON.stringify({
          ...context,
          reason: 'no_assets',
        })}`,
      );
      return;
    }

    this.logger.log(
      `Cloudinary cleanup started | meta=${JSON.stringify({
        ...context,
        total: uniqueIds.length,
      })}`,
    );

    const results = await Promise.allSettled(
      uniqueIds.map((publicId) => this.cloudinaryService.deleteImage(publicId)),
    );

    const deletedIds: string[] = [];
    const notFoundIds: string[] = [];
    const failedIds: string[] = [];

    results.forEach((result, index) => {
      const publicId = uniqueIds[index];

      if (result.status === 'rejected') {
        failedIds.push(publicId);
        return;
      }

      if (result.value.status === 'not_found') {
        notFoundIds.push(publicId);
        return;
      }

      deletedIds.push(publicId);
    });

    if (failedIds.length > 0) {
      this.logger.warn(
        `Cloudinary cleanup partially failed | meta=${JSON.stringify({
          ...context,
          total: uniqueIds.length,
          deletedCount: deletedIds.length,
          notFoundCount: notFoundIds.length,
          failedCount: failedIds.length,
          notFoundIds,
          failedIds,
        })}`,
      );
      return;
    }

    if (notFoundIds.length > 0) {
      this.logger.warn(
        `Cloudinary cleanup completed with not_found results | meta=${JSON.stringify(
          {
            ...context,
            total: uniqueIds.length,
            deletedCount: deletedIds.length,
            notFoundCount: notFoundIds.length,
            notFoundIds,
          },
        )}`,
      );
      return;
    }

    this.logger.log(
      `Cloudinary cleanup succeeded | meta=${JSON.stringify({
        ...context,
        total: uniqueIds.length,
        deletedCount: deletedIds.length,
      })}`,
    );
  }
}
