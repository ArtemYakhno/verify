import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  GALLERY_MESSAGES,
  IMAGE_MESSAGES,
} from '../common/constants/messages.constants';
import { MAX_IMAGES_PER_GALLERY } from '../common/constants/limits.constants';

@Injectable()
export class GalleryCountersService {
  constructor(private readonly prismaService: PrismaService) {}

  async changeImagesCount(
    tx: Prisma.TransactionClient,
    galleryId: number,
    diff: number,
  ): Promise<void> {
    if (diff === 0) return;

    await tx.gallery.update({
      where: { id: galleryId },
      data: {
        imagesCount:
          diff > 0 ? { increment: diff } : { decrement: Math.abs(diff) },
      },
    });
  }

  async setImagesCount(
    tx: Prisma.TransactionClient,
    galleryId: number,
    count: number,
  ): Promise<void> {
    await tx.gallery.update({
      where: { id: galleryId },
      data: { imagesCount: count },
    });
  }

  async resetImagesCount(
    tx: Prisma.TransactionClient,
    galleryId: number,
  ): Promise<void> {
    await tx.gallery.update({
      where: { id: galleryId },
      data: { imagesCount: 0 },
    });
  }

  async ensureGalleryCapacity(
    tx: Prisma.TransactionClient,
    galleryId: number,
    adding: number,
  ): Promise<void> {
    const gallery = await tx.gallery.findUnique({
      where: { id: galleryId },
      select: { imagesCount: true },
    });

    if (!gallery) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    if (gallery.imagesCount + adding > MAX_IMAGES_PER_GALLERY) {
      throw new ConflictException(
        IMAGE_MESSAGES.MAX_IMAGES(
          gallery.imagesCount,
          adding,
          MAX_IMAGES_PER_GALLERY,
        ),
      );
    }
  }
}
