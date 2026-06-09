import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { MoveCopyImageDto } from './dto/move-copy-image.dto';
import { ImageMetadataDto } from './dto/image-metadata.dto';
import { GalleryAccessService } from '../galleries/gallery-access.service';
import { GalleryCountersService } from '../galleries/gallery-counters.service';
import {
  ImageInternal,
  imageInternalSelect,
  imageSelect,
} from '../common/types/image.types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { IMAGE_MESSAGES } from '../common/constants/messages.constants';
import { Gallery } from '../common/types/gallery.types';
import { notDeletedWhere } from '../common/constants/constraints.constants';
import { User } from '../common/types/user.types';
import { ResourceState } from '../common/types/resource-state.type';
import { DeletionReason, Prisma } from '../../generated/prisma/client';
import { MediaCleanupService } from '../common/services/media-cleanup.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly galleryAccessService: GalleryAccessService,
    private readonly galleryCountersService: GalleryCountersService,
    private readonly mediaCleanupService: MediaCleanupService,
  ) {}

  async findPartByGallery(galleryId: number, query: PaginationQueryDto) {
    const { page, perPage, orderDir } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.image.findMany({
        where: { galleryId, ...notDeletedWhere },
        skip,
        take: perPage,
        select: imageSelect,
        orderBy: { createdAt: orderDir },
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

  async findAllByGallery(galleryId: number) {
    return await this.prismaService.image.findMany({
      where: { galleryId, ...notDeletedWhere },
      select: imageSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(imageId: number, state: ResourceState = 'active') {
    const where: Prisma.ImageWhereInput =
      state === 'active'
        ? { id: imageId, deletedAt: null }
        : state === 'deleted'
          ? { id: imageId, deletedAt: { not: null } }
          : { id: imageId };

    const image = await this.prismaService.image.findFirst({
      where,
      select: {
        ...imageInternalSelect,
        gallery: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException(IMAGE_MESSAGES.NOT_FOUND(imageId));
    }

    return image;
  }

  async findDeletedByGallery(galleryId: number) {
    return await this.prismaService.image.findMany({
      where: { galleryId, deletedAt: { not: null } },
      select: imageSelect,
      orderBy: { deletedAt: 'desc' },
    });
  }

  async uploadImage(
    gallery: Gallery,
    file: Express.Multer.File,
    dto: ImageMetadataDto,
  ) {
    let uploadedPublicId: string | null = null;

    try {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(
          file.buffer,
          file.originalname,
        );

      uploadedPublicId = public_id;

      return await this.prismaService.$transaction(async (tx) => {
        const created = await tx.image.create({
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

        await this.galleryCountersService.changeImagesCount(tx, gallery.id, 1);

        return created;
      });
    } catch (error) {
      if (uploadedPublicId) {
        await this.mediaCleanupService.deleteCloudinaryImages(
          [uploadedPublicId],
          {
            scope: 'upload',
            galleryId: gallery.id,
          },
        );
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

  async move(
    imageId: number,
    galleryId: number,
    dto: MoveCopyImageDto,
    user: User,
  ) {
    const targetGallery = await this.checkMoveCopyConflicts(
      galleryId,
      dto.targetGalleryId,
      user,
    );

    return this.prismaService.$transaction(async (tx) => {
      const image = await tx.image.findUnique({
        where: { id: imageId },
        select: {
          id: true,
          galleryId: true,
          deletedAt: true,
        },
      });

      if (!image) {
        throw new NotFoundException(IMAGE_MESSAGES.NOT_FOUND(imageId));
      }

      if (image.deletedAt === null) {
        await this.galleryCountersService.changeImagesCount(
          tx,
          targetGallery.id,
          1,
        );
      }

      const moved = await tx.image.update({
        where: { id: imageId },
        data: { galleryId: targetGallery.id },
        select: imageSelect,
      });

      if (image.deletedAt === null) {
        await this.galleryCountersService.changeImagesCount(
          tx,
          image.galleryId,
          -1,
        );
      }

      return moved;
    });
  }

  async copy(
    image: ImageInternal,
    galleryId: number,
    dto: MoveCopyImageDto,
    user: User,
  ) {
    const targetGallery = await this.checkMoveCopyConflicts(
      galleryId,
      dto.targetGalleryId,
      user,
    );
    const buffer = await this.cloudinaryService.downloadImageBuffer(image.path);

    let uploadedPublicId: string | null = null;

    try {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(
          buffer,
          image.originalFilename,
        );

      uploadedPublicId = public_id;

      return await this.prismaService.$transaction(async (tx) => {
        const created = await tx.image.create({
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

        await this.galleryCountersService.changeImagesCount(
          tx,
          targetGallery.id,
          1,
        );

        return created;
      });
    } catch (error) {
      if (uploadedPublicId) {
        await this.mediaCleanupService.deleteCloudinaryImages(
          [uploadedPublicId],
          {
            scope: 'copy',
            imageId: image.id,
            galleryId,
            targetGalleryId: dto.targetGalleryId,
          },
        );
      }

      throw error;
    }
  }

  async softDelete(
    image: ImageInternal,
    reason: DeletionReason = DeletionReason.MANUAL,
    tx?: Prisma.TransactionClient,
  ) {
    const execute = async (db: Prisma.TransactionClient) => {
      const result = await db.image.updateMany({
        where: {
          id: image.id,
          galleryId: image.galleryId,
          ...notDeletedWhere,
        },
        data: {
          deletedAt: new Date(),
          deletionReason: reason,
        },
      });

      if (result.count === 0) {
        return;
      }

      await this.galleryCountersService.changeImagesCount(
        db,
        image.galleryId,
        -1,
      );
    };

    if (tx) {
      await execute(tx);
      return true;
    }

    await this.prismaService.$transaction(async (innerTx) => {
      await execute(innerTx);
    });

    return true;
  }

  async softDeleteAll(
    galleryId: number,
    reason: DeletionReason = DeletionReason.MANUAL,
    tx?: Prisma.TransactionClient,
  ) {
    const execute = async (db: Prisma.TransactionClient) => {
      const result = await db.image.updateMany({
        where: {
          galleryId,
          ...notDeletedWhere,
        },
        data: {
          deletedAt: new Date(),
          deletionReason: reason,
        },
      });

      if (result.count > 0) {
        await this.galleryCountersService.resetImagesCount(db, galleryId);
      }
    };

    if (tx) {
      await execute(tx);
      return true;
    }

    await this.prismaService.$transaction(async (innerTx) => {
      await execute(innerTx);
    });

    return true;
  }

  async purge(image: ImageInternal) {
    const cloudinaryIds = await this.prismaService.$transaction(async (tx) => {
      await tx.image.delete({
        where: { id: image.id },
      });

      await this.galleryCountersService.changeImagesCount(
        tx,
        image.galleryId,
        -1,
      );
      return [image.cloudinaryId];
    });

    await this.mediaCleanupService.deleteCloudinaryImages(cloudinaryIds, {
      scope: 'image',
      imageId: image.id,
      galleryId: image.galleryId,
    });

    return true;
  }

  async restore(image: ImageInternal) {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.image.updateMany({
        where: {
          id: image.id,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });

      if (result.count > 0) {
        await this.galleryCountersService.changeImagesCount(
          tx,
          image.galleryId,
          1,
        );
      }

      return true;
    });
  }

  async checkMoveCopyConflicts(
    galleryId: number,
    targetGalleryId: number,
    user: User,
  ) {
    if (galleryId === targetGalleryId) {
      throw new ConflictException(IMAGE_MESSAGES.SAME_GALLERY);
    }

    const targetGallery =
      await this.galleryAccessService.getAccessibleGalleryOrThrow(
        targetGalleryId,
        user,
      );

    return targetGallery;
  }
}
