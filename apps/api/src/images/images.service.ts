import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ImageInternal, imageSelect } from '../../common/types/image.types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MoveCopyImageDto } from './dto/move-copy-image.dto';
import {
  GALLERY_MESSAGES,
  IMAGE_MESSAGES,
} from '../../common/constants/messages.constants';
import { ImageMetadataDto } from './dto/image-metadata.dto';
import { parseAndValidateJsonArray } from '../../common/utils/parseAndValidateJsonArray';
import { GalleryDetail } from '../../common/types/gallery.types';
import { MAX_IMAGES_PER_GALLERY } from '../../common/constants/limits.constants';
import { GalleryAccessService } from '../galleries/gallery-access.service';
import { UploadedImageDraft } from './types/UploadedImageDraft';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly galleryAccessService: GalleryAccessService,
  ) {}

  async findAllByGallery(galleryId: number) {
    return await this.prismaService.image.findMany({
      where: { galleryId },
      select: imageSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByGallery(galleryId: number, query: PaginationQueryDto) {
    const galleryExists = await this.prismaService.gallery.findUnique({
      where: { id: galleryId },
      select: { id: true },
    });

    if (!galleryExists) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    const { page, perPage } = query;
    const skip = (page - 1) * perPage;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.image.findMany({
        where: { galleryId },
        skip,
        take: perPage,
        select: imageSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.image.count({ where: { galleryId } }),
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

  async uploadToGallery(
    gallery: GalleryDetail,
    files: Express.Multer.File[],
    metadataRaw?: string,
  ) {
    const galleryId = gallery.id;

    if (!files.length) {
      throw new BadRequestException(IMAGE_MESSAGES.NO_FILES);
    }

    let metadata: ImageMetadataDto[] = [];

    if (metadataRaw) {
      metadata = await parseAndValidateJsonArray(
        metadataRaw,
        ImageMetadataDto,
        IMAGE_MESSAGES.INVALID_METADATA,
      );
    }

    if (metadata.length && metadata.length !== files.length) {
      throw new BadRequestException(IMAGE_MESSAGES.METADATA_MISMATCH);
    }

    await this.ensureGalleryCapacity(
      gallery.id,
      files.length,
      gallery._count.images,
    );

    const uploaded: UploadedImageDraft[] = [];

    try {
      for (const [index, file] of files.entries()) {
        const { secure_url, public_id } =
          await this.cloudinaryService.uploadImage(
            file.buffer,
            file.originalname,
          );

        uploaded.push({
          path: secure_url,
          cloudinaryId: public_id,
          originalFilename: file.originalname,
          name: metadata[index]?.name ?? null,
          comment: metadata[index]?.comment ?? null,
        });
      }

      const createdImages = await this.prismaService.$transaction(
        uploaded.map((item) =>
          this.prismaService.image.create({
            data: {
              path: item.path,
              cloudinaryId: item.cloudinaryId,
              originalFilename: item.originalFilename,
              name: item.name,
              comment: item.comment,
              galleryId,
            },
            select: imageSelect,
          }),
        ),
      );

      return createdImages;
    } catch (error) {
      if (uploaded.length > 0) {
        await Promise.allSettled(
          uploaded.map((item) =>
            this.cloudinaryService.deleteImage(item.cloudinaryId),
          ),
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

  async deleteImage(image: ImageInternal) {
    await this.prismaService.image.delete({
      where: { id: image.id },
    });

    await this.cloudinaryService.deleteImage(image.cloudinaryId);

    return true;
  }

  async moveImage(
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

  async copyImage(
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
        where: { galleryId },
      }));

    if (count + adding > MAX_IMAGES_PER_GALLERY) {
      throw new BadRequestException(
        IMAGE_MESSAGES.MAX_IMAGES(count, adding, MAX_IMAGES_PER_GALLERY),
      );
    }
  }
}
