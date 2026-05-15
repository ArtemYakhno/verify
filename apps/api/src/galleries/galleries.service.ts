import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { GALLERY_MESSAGES } from '../../common/constants/messages.constants';
import {
  galleryDetailSelect,
  galleryListSelect,
} from '../../common/types/gallery.types';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GalleriesService {
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
      select: {
        cloudinaryId: true,
      },
    });

    await this.prismaService.gallery.delete({
      where: { id: galleryId },
    });

    if (images.length === 0) {
      return true;
    }
    await this.cloudinaryService.deleteManyImages(
      images.map((img) => img.cloudinaryId),
    );

    return true;
  }
}
