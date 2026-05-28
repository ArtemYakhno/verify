import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { gallerySelect } from '../common/types/gallery.types';
import { GALLERY_MESSAGES } from '../common/constants/messages.constants';
import { Prisma } from '../../generated/prisma/client';
import type { ResourceState } from '../common/types/resource-state.type';
@Injectable()
export class GalleryAccessService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOwnedGalleryOrThrow(
    galleryId: number,
    userId: number,
    state: ResourceState = 'active',
  ) {
    const where: Prisma.GalleryWhereInput =
      state === 'active'
        ? { id: galleryId, deletedAt: null }
        : state === 'deleted'
          ? { id: galleryId, deletedAt: { not: null } }
          : { id: galleryId };

    const gallery = await this.prismaService.gallery.findFirst({
      where,
      select: gallerySelect,
    });

    if (!gallery) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    if (gallery.userId !== userId) {
      throw new ForbiddenException(GALLERY_MESSAGES.FORBIDDEN);
    }

    return gallery;
  }
}
