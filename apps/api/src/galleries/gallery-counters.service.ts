import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IMAGE_MESSAGES } from '../common/constants/messages.constants';
import {
  MAX_IMAGES_PER_GALLERY,
  MIN_IMAGES_PER_GALLERY,
} from '../common/constants/limits.constants';

@Injectable()
export class GalleryCountersService {
  constructor(private readonly prismaService: PrismaService) {}

  async changeImagesCount(
    tx: Prisma.TransactionClient,
    galleryId: number,
    diff: number,
  ): Promise<void> {
    if (diff === 0) return;

    if (diff > 0) {
      const result = await tx.gallery.updateMany({
        where: {
          id: galleryId,
          imagesCount: {
            lte: MAX_IMAGES_PER_GALLERY - diff,
          },
        },
        data: {
          imagesCount: { increment: diff },
        },
      });

      //Gallery checker method implemented before, so we know the gallery exists. No need to check again.
      if (result.count === 0) {
        throw new ConflictException(
          IMAGE_MESSAGES.MAX_IMAGES(MAX_IMAGES_PER_GALLERY),
        );
      }

      return;
    }

    const decrementBy = Math.abs(diff);

    const result = await tx.gallery.updateMany({
      where: {
        id: galleryId,
        imagesCount: {
          gte: decrementBy,
        },
      },
      data: {
        imagesCount: { decrement: decrementBy },
      },
    });

    if (result.count === 0) {
      throw new ConflictException(
        IMAGE_MESSAGES.MIN_IMAGES(MIN_IMAGES_PER_GALLERY),
      );
    }
  }

  async setImagesCount(
    tx: Prisma.TransactionClient,
    galleryId: number,
    count: number,
  ): Promise<void> {
    if (count < MIN_IMAGES_PER_GALLERY || count > MAX_IMAGES_PER_GALLERY) {
      throw new ConflictException(
        IMAGE_MESSAGES.LIMIT_IMAGES(
          MIN_IMAGES_PER_GALLERY,
          MAX_IMAGES_PER_GALLERY,
        ),
      );
    }

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
}
