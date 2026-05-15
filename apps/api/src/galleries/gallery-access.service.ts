import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GALLERY_MESSAGES } from '../../common/constants/messages.constants';
import { galleryDetailSelect } from '../../common/types/gallery.types';

@Injectable()
export class GalleryAccessService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOwnedGalleryOrThrow(galleryId: number, userId: number) {
    const gallery = await this.prismaService.gallery.findUnique({
      where: { id: galleryId },
      select: galleryDetailSelect,
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
