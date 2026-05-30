import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CloudinaryService } from '../common/services/cloudinary.service';
import {
  gallerySelect,
  galleryListSelect,
} from '../common/types/gallery.types';
import { GALLERY_MESSAGES } from '../common/constants/messages.constants';
import { notDeletedWhere } from '../common/constants/constraints.constants';
import { FindAllGalleriesQueryDto } from './dto/find-all-galleries-query.dto';
import { GalleryCountersService } from './gallery-counters.service';
import { DeletionReason, Prisma } from '../../generated/prisma/client';
import { ResourceState } from '../common/types/resource-state.type';
import { ImagesService } from '../images/images.service';

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(GalleriesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly galleryCountersService: GalleryCountersService,
    protected readonly imagesService: ImagesService,
  ) {}

  async findPart(query: FindAllGalleriesQueryDto) {
    const { page, perPage, orderBy = 'createdAt', orderDir } = query;

    const skip = (page - 1) * perPage;

    const where = this.buildFindAllWhere(query);

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.gallery.findMany({
        where,
        skip,
        take: perPage,
        select: galleryListSelect,
        orderBy: { [orderBy]: orderDir },
      }),
      this.prismaService.gallery.count({ where }),
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

  async findById(galleryId: number, state: ResourceState = 'active') {
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

    return gallery;
  }

  async findAllByUser(userId: number) {
    return this.prismaService.gallery.findMany({
      where: { userId, ...notDeletedWhere },
      select: gallerySelect,
    });
  }

  async findDeletedByUser(userId: number) {
    return await this.prismaService.gallery.findMany({
      where: { userId, deletedAt: { not: null } },
      select: galleryListSelect,
      orderBy: { deletedAt: 'desc' },
    });
  }

  async create(userId: number, createGalleryDto: CreateGalleryDto) {
    return this.prismaService.gallery.create({
      data: { ...createGalleryDto, userId, imagesCount: 0 },
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

  async softDelete(
    galleryId: number,
    reason: DeletionReason = DeletionReason.MANUAL,
    tx?: Prisma.TransactionClient,
  ) {
    const execute = async (db: Prisma.TransactionClient) => {
      await db.gallery.update({
        where: { id: galleryId },
        data: {
          deletedAt: new Date(),
          deletionReason: reason,
        },
      });

      await this.imagesService.softDeleteAll(
        galleryId,
        DeletionReason.INHERIT,
        db,
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

  async purge(galleryId: number, tx?: Prisma.TransactionClient) {
    const images = await this.prismaService.image.findMany({
      where: { galleryId },
      select: {
        cloudinaryId: true,
      },
    });

    if (images.length > 0) {
      const results = await Promise.allSettled(
        images.map((img) =>
          this.cloudinaryService.deleteImage(img.cloudinaryId),
        ),
      );

      const failed = results.filter((result) => result.status === 'rejected');

      if (failed.length > 0) {
        this.logger.warn(
          `Gallery ${galleryId}: ${failed.length}/${images.length} Cloudinary deletes failed`,
        );
      }
    }

    const execute = async (db: Prisma.TransactionClient) => {
      await db.gallery.delete({
        where: { id: galleryId },
      });
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

  async restore(galleryId: number, tx?: Prisma.TransactionClient) {
    const execute = async (db: Prisma.TransactionClient) => {
      await db.gallery.update({
        where: { id: galleryId },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });

      await db.image.updateMany({
        where: {
          galleryId,
          deletedAt: { not: null },
          deletionReason: DeletionReason.INHERIT,
        },
        data: {
          deletedAt: null,
          deletionReason: null,
        },
      });

      const activeImagesCount = await db.image.count({
        where: {
          galleryId,
          deletedAt: null,
        },
      });

      await this.galleryCountersService.ensureGalleryCapacity(
        db,
        galleryId,
        activeImagesCount,
      );

      await this.galleryCountersService.setImagesCount(
        db,
        galleryId,
        activeImagesCount,
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

  private buildFindAllWhere(
    query: FindAllGalleriesQueryDto,
  ): Prisma.GalleryWhereInput {
    const { search, createdFrom, createdTo, minImages, maxImages } = query;

    const where: Prisma.GalleryWhereInput = {
      ...notDeletedWhere,
    };

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};

      if (createdFrom) {
        where.createdAt.gte = createdFrom;
      }

      if (createdTo) {
        const endOfDay = new Date(createdTo);
        endOfDay.setHours(23, 59, 59, 999);

        where.createdAt.lte = endOfDay;
      }
    }

    const hasMinImages = minImages !== undefined;
    const hasMaxImages = maxImages !== undefined;

    if (hasMinImages || hasMaxImages) {
      where.imagesCount = {};

      if (hasMinImages) {
        where.imagesCount.gte = minImages;
      }

      if (hasMaxImages) {
        where.imagesCount.lte = maxImages;
      }
    }

    return where;
  }
}
