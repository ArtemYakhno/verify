import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { MoveCopyImageDto } from './dto/move-copy-image.dto';

import { ImageMetadataDto } from './dto/image-metadata.dto';
import { GalleryAccessService } from '../galleries/gallery-access.service';
import { ImageInternal, imageSelect } from '../common/types/image.types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  GALLERY_MESSAGES,
  IMAGE_MESSAGES,
} from '../common/constants/messages.constants';
import { Gallery } from '../common/types/gallery.types';
import { MAX_IMAGES_PER_GALLERY } from '../common/constants/limits.constants';
import { notDeletedWhere } from '../common/constants/constraints.constants';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly galleryAccessService: GalleryAccessService,
  ) {}

  async findAllByGallery(galleryId: number) {
    return await this.prismaService.image.findMany({
      where: { galleryId, ...notDeletedWhere },
      select: imageSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPartByGallery(galleryId: number, query: PaginationQueryDto) {
    const galleryExists = await this.prismaService.gallery.findUnique({
      where: { id: galleryId, ...notDeletedWhere },
      select: { id: true },
    });

    if (!galleryExists) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    const { page, perPage } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.image.findMany({
        where: { galleryId, ...notDeletedWhere },
        skip,
        take: perPage,
        select: imageSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.image.count({
        where: { galleryId, ...notDeletedWhere },
      }),
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

  async uploadImage(
    gallery: Gallery,
    file: Express.Multer.File,
    dto: ImageMetadataDto,
  ) {
    await this.ensureGalleryCapacity(gallery.id, 1, gallery._count.images);

    let uploadedPublicId: string | null = null;

    try {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(
          file.buffer,
          file.originalname,
        );

      uploadedPublicId = public_id;

      return await this.prismaService.image.create({
        data: {
          path: secure_url,
          cloudinaryId: public_id,
          originalFilename: file.originalname,
          name: dto.name ?? null,
          comment: dto.comment ?? null,
          galleryId: gallery.id,
        },
        select: imageSelect,
      });
    } catch (error) {
      if (uploadedPublicId) {
        await Promise.allSettled([
          this.cloudinaryService.deleteImage(uploadedPublicId),
        ]);
      }
      throw error;
    }
  }

  async updateMetadata(imageId: number, dto: ImageMetadataDto) {
    return await this.prismaService.image.update({
      where: { id: imageId },
      data: dto,
      select: imageSelect,
    });
  }

  async softDelete(image: ImageInternal) {
    await this.prismaService.image.update({
      where: { id: image.id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  async purge(image: ImageInternal) {
    await Promise.allSettled([
      this.cloudinaryService.deleteImage(image.cloudinaryId),
    ]);
    await this.prismaService.image.delete({ where: { id: image.id } });
    return true;
  }

  async restore(imageId: number) {
    return await this.prismaService.image.update({
      where: { id: imageId },
      data: { deletedAt: null },
      select: imageSelect,
    });
  }

  async findDeleted(galleryId: number) {
    return await this.prismaService.image.findMany({
      where: { galleryId, deletedAt: { not: null } },
      select: imageSelect,
      orderBy: { deletedAt: 'desc' },
    });
  }

  async move(
    imageId: number,
    galleryId: number,
    dto: MoveCopyImageDto,
    userId: number,
  ) {
    if (galleryId === dto.targetGalleryId) {
      throw new BadRequestException(IMAGE_MESSAGES.SAME_GALLERY_MOVE);
    }

    await this.galleryAccessService.getOwnedGalleryOrThrow(
      dto.targetGalleryId,
      userId,
    );
    await this.ensureGalleryCapacity(dto.targetGalleryId, 1);

    return this.prismaService.image.update({
      where: { id: imageId },
      data: { galleryId: dto.targetGalleryId },
      select: imageSelect,
    });
  }

  async copy(
    image: ImageInternal,
    galleryId: number,
    dto: MoveCopyImageDto,
    userId: number,
  ) {
    if (galleryId === dto.targetGalleryId) {
      throw new BadRequestException(IMAGE_MESSAGES.SAME_GALLERY_MOVE);
    }

    await this.galleryAccessService.getOwnedGalleryOrThrow(
      dto.targetGalleryId,
      userId,
    );
    await this.ensureGalleryCapacity(dto.targetGalleryId, 1);

    const buffer = await this.cloudinaryService.downloadImageBuffer(image.path);

    let uploadedPublicId: string | null = null;

    try {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(
          buffer,
          image.originalFilename,
        );

      uploadedPublicId = public_id;

      return await this.prismaService.image.create({
        data: {
          path: secure_url,
          cloudinaryId: public_id,
          originalFilename: image.originalFilename,
          name: image.name,
          comment: image.comment,
          galleryId: dto.targetGalleryId,
        },
        select: imageSelect,
      });
    } catch (error) {
      if (uploadedPublicId) {
        await Promise.allSettled([
          this.cloudinaryService.deleteImage(uploadedPublicId),
        ]);
      }

      throw error;
    }
  }

  private async ensureGalleryCapacity(
    galleryId: number,
    adding: number,
    currentCount?: number,
  ): Promise<void> {
    const count =
      currentCount ??
      (await this.prismaService.image.count({
        where: { galleryId, ...notDeletedWhere },
      }));

    if (count + adding > MAX_IMAGES_PER_GALLERY) {
      throw new BadRequestException(
        IMAGE_MESSAGES.MAX_IMAGES(count, adding, MAX_IMAGES_PER_GALLERY),
      );
    }
  }

  async softDeleteAll(galleryId: number) {
    await this.prismaService.image.updateMany({
      where: {
        galleryId,
        ...notDeletedWhere,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return true;
  }
}
