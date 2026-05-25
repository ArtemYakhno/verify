import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  gallerySelect,
  galleryListSelect,
} from '../common/types/gallery.types';
import { GALLERY_MESSAGES } from '../common/constants/messages.constants';
import { notDeletedWhere } from '../common/constants/constraints.constants';

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findPart(query: PaginationQueryDto) {
    const { page, perPage, orderBy = 'createdAt', orderDir = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.gallery.findMany({
        where: { ...notDeletedWhere },
        skip,
        take: perPage,
        select: galleryListSelect,
        orderBy: { [orderBy]: orderDir },
      }),
      this.prismaService.gallery.count({ where: { ...notDeletedWhere } }),
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
      where: { id: galleryId, ...notDeletedWhere },
      select: gallerySelect,
    });

    if (!gallery) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    return gallery;
  }

  async findMy(userId: number) {
    return this.prismaService.gallery.findMany({
      where: { userId, ...notDeletedWhere },
      select: gallerySelect,
    });
  }

  async create(userId: number, createGalleryDto: CreateGalleryDto) {
    return this.prismaService.gallery.create({
      data: { ...createGalleryDto, userId },
      select: gallerySelect,
    });
  }

  async update(galleryId: number, updateGalleryDto: UpdateGalleryDto) {
    return this.prismaService.gallery.update({
      where: { id: galleryId },
      data: updateGalleryDto,
      select: gallerySelect,
    });
  }

  async softDelete(galleryId: number) {
    await this.prismaService.$transaction([
      this.prismaService.gallery.update({
        where: { id: galleryId },
        data: { deletedAt: new Date() },
      }),
      this.prismaService.image.updateMany({
        where: { galleryId },
        data: { deletedAt: new Date() },
      }),
    ]);

    return true;
  }

  async restore(galleryId: number) {
    await this.prismaService.$transaction([
      this.prismaService.gallery.update({
        where: { id: galleryId },
        data: { deletedAt: null },
      }),
      this.prismaService.image.updateMany({
        where: { galleryId, deletedAt: { not: null } },
        data: { deletedAt: null },
      }),
    ]);

    return true;
  }

  async purge(galleryId: number) {
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
          `Gallery ${galleryId}: ${failed.length}/${images.length} Cloudinary deletes failed.`,
        );
      }
    }

    await this.prismaService.gallery.delete({ where: { id: galleryId } });
    return true;
  }

  async findDeleted(userId: number) {
    return await this.prismaService.gallery.findMany({
      where: { userId, deletedAt: { not: null } },
      select: galleryListSelect,
      orderBy: { deletedAt: 'desc' },
    });
  }
}
