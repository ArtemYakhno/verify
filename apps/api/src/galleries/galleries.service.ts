import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  galleryDetailSelect,
  galleryListSelect,
} from '../common/types/gallery.types';
import { GALLERY_MESSAGES } from '../common/constants/messages.constants';

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page, perPage, orderBy = 'createdAt', orderDir = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.gallery.findMany({
        skip,
        take: perPage,
        select: galleryListSelect,
        orderBy: { [orderBy]: orderDir },
      }),
      this.prismaService.gallery.count(),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(galleryId: number) {
    const gallery = await this.prismaService.gallery.findUnique({
      where: { id: galleryId },
      select: galleryDetailSelect,
    });

    if (!gallery) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    return gallery;
  }

  async create(userId: number, createGalleryDto: CreateGalleryDto) {
    return this.prismaService.gallery.create({
      data: { ...createGalleryDto, userId },
      select: galleryDetailSelect,
    });
  }

  async update(galleryId: number, updateGalleryDto: UpdateGalleryDto) {
    return this.prismaService.gallery.update({
      where: { id: galleryId },
      data: updateGalleryDto,
      select: galleryDetailSelect,
    });
  }

  async delete(galleryId: number) {
    const images = await this.prismaService.image.findMany({
      where: { galleryId },
      select: { cloudinaryId: true },
    });

    if (images.length > 0) {
      const results = await Promise.allSettled(
        images.map((img) =>
          this.cloudinaryService.deleteImage(img.cloudinaryId),
        ),
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        this.logger.warn(
          `Gallery ${galleryId}: ${failed.length}/${images.length} Cloudinary deletes failed. Orphaned files may exist.`,
        );
      }
    }

    await this.prismaService.gallery.delete({ where: { id: galleryId } });

    return true;
  }
}
