import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ImagesService } from './images.service';
import { MoveCopyImageDto } from './dto/move-copy-image.dto';
import { ImageResponseDto, PaginatedImagesDto } from './dto/image-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GalleryOwnerGuard } from '../../common/guards/gallery-owner.guard';
import { ImageOwnerGuard } from './guards/image-owner.guard';
import { GalleryInfo } from '../../common/decorators/gallery-info.decorator';
import {
  AUTH_MESSAGES,
  GALLERY_MESSAGES,
  IMAGE_MESSAGES,
} from '../../common/constants/messages.constants';

import { MulterExceptionFilter } from '../../common/filters/multer-exception-filter';
import { STATUS_CODES } from 'node:http';
import { ImageMetadataDto } from './dto/image-metadata.dto';
import type { GalleryDetail } from '../../common/types/gallery.types';
import { ImageInfo } from '../../common/decorators/image-info.decorator';
import type { ImageInternal } from '../../common/types/image.types';
import {
  ALLOWED_IMAGES_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
} from '../../common/constants/limits.constants';

@ApiTags('Images')
@Controller('galleries/:id/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard)
  @ApiOperation({
    summary: 'Get all images for editing (owner only, no pagination)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiResponse({ status: HttpStatus.OK, type: [ImageResponseDto] })
  findAll(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.findAllByGallery(galleryId);
  }

  @Get()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get images by gallery (paginated), auth required' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedImagesDto })
  findByGallery(
    @GalleryInfo('id') galleryId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.imagesService.findByGallery(galleryId, query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard)
  @UseInterceptors(
    FilesInterceptor('images', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGES_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              IMAGE_MESSAGES.UNSUPORTED_FILE_TYPE(ALLOWED_IMAGES_TYPES),
            ),
            false,
          );
        }
      },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        metadata: {
          type: 'string',
          description: 'JSON array of metadata per image (same order as files)',
          example:
            '[{"name":"Jhon Snow","comment":"Actor"},{"name":null,"comment":null}]',
        },
      },
      required: ['images'],
    },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiOperation({ summary: 'Upload images to gallery (owner only)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: [ImageResponseDto] })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiBadRequestResponse({
    description: 'Invalid upload request',
    content: {
      'application/json': {
        examples: {
          noFiles: {
            summary: 'No files uploaded',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.NO_FILES,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },
          invalidMetadata: {
            summary: 'Invalid metadata JSON',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.INVALID_METADATA,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },
          metadataMismatch: {
            summary: 'Metadata count mismatch',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.METADATA_MISMATCH,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },

          maxImages: {
            summary: 'Gallery limit exceeded',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.MAX_IMAGES_DESCRIPTION,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },

          invalidFileType: {
            summary: 'Invalid file type',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                IMAGE_MESSAGES.UNSUPORTED_FILE_TYPE(ALLOWED_IMAGES_TYPES),
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },
          limitFileSize: {
            summary: 'Size of file is too large',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.LIMIT_FILE_SIZE,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },

          limitFileCount: {
            summary: 'Files limit',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.LIMIT_FILE_COUNT,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },

          otherFileError: {
            summary: 'Other error with file upload',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.OTHERE_FILE_ERRORS,
              error: STATUS_CODES[HttpStatus.BAD_REQUEST],
            },
          },
        },
      },
    },
  })
  upload(
    @GalleryInfo() gallery: GalleryDetail,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata') metadataRaw?: string,
  ) {
    return this.imagesService.uploadToGallery(gallery, files, metadataRaw);
  }

  @Patch(':imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard)
  @ApiOperation({
    summary: 'Update image metadata auth + gallery owner + image owner',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    required: true,
    example: 1,
    description: 'Image id',
  })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: IMAGE_MESSAGES.FORBIDDEN })
  updateMetadata(
    @ImageInfo('id') imageId: number,
    @Body() dto: ImageMetadataDto,
  ) {
    return this.imagesService.updateMetadata(imageId, dto);
  }

  @Delete(':imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard)
  @ApiOperation({ summary: 'Delete image (owner only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    required: true,
    example: 1,
    description: 'Image id',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: IMAGE_MESSAGES.FORBIDDEN })
  delete(@ImageInfo() image: ImageInternal) {
    return this.imagesService.deleteImage(image);
  }

  @Patch(':imageId/move')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard)
  @ApiOperation({ summary: 'Move image to another gallery (owner only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    required: true,
    example: 1,
    description: 'Image id',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({
    description: 'Requested resource was not found',
    content: {
      'application/json': {
        examples: {
          imageNotFound: {
            summary: 'Image not found',
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION,
              error: STATUS_CODES[HttpStatus.NOT_FOUND],
            },
          },
          galleryNotFound: {
            summary: 'Gallery not found',
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION,
              error: STATUS_CODES[HttpStatus.NOT_FOUND],
            },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    content: {
      'application/json': {
        examples: {
          imageForbidden: {
            summary: 'Image access denied',
            value: {
              statusCode: HttpStatus.FORBIDDEN,
              message: IMAGE_MESSAGES.FORBIDDEN,
              error: STATUS_CODES[HttpStatus.FORBIDDEN],
            },
          },
          galleryForbidden: {
            summary: 'Gallery access denied',
            value: {
              statusCode: HttpStatus.FORBIDDEN,
              message: GALLERY_MESSAGES.FORBIDDEN,
              error: STATUS_CODES[HttpStatus.FORBIDDEN],
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: IMAGE_MESSAGES.MAX_IMAGES_DESCRIPTION })
  move(
    @ImageInfo('id') imageId: number,
    @Param('id', ParseIntPipe) galleryId: number,
    @Body() dto: MoveCopyImageDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.imagesService.moveImage(imageId, galleryId, dto, userId);
  }

  @Post(':imageId/copy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard)
  @ApiOperation({ summary: 'Copy image to another gallery (owner only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    required: true,
    example: 1,
    description: 'Image id',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({
    description: 'Requested resource was not found',
    content: {
      'application/json': {
        examples: {
          imageNotFound: {
            summary: 'Image not found',
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION,
              error: STATUS_CODES[HttpStatus.NOT_FOUND],
            },
          },
          galleryNotFound: {
            summary: 'Gallery not found',
            value: {
              statusCode: HttpStatus.NOT_FOUND,
              message: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION,
              error: STATUS_CODES[HttpStatus.NOT_FOUND],
            },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    content: {
      'application/json': {
        examples: {
          imageForbidden: {
            summary: 'Image access denied',
            value: {
              statusCode: HttpStatus.FORBIDDEN,
              message: IMAGE_MESSAGES.FORBIDDEN,
              error: STATUS_CODES[HttpStatus.FORBIDDEN],
            },
          },
          galleryForbidden: {
            summary: 'Gallery access denied',
            value: {
              statusCode: HttpStatus.FORBIDDEN,
              message: GALLERY_MESSAGES.FORBIDDEN,
              error: STATUS_CODES[HttpStatus.FORBIDDEN],
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: IMAGE_MESSAGES.MAX_IMAGES_DESCRIPTION })
  copy(
    @ImageInfo() image: ImageInternal,
    @Body() dto: MoveCopyImageDto,
    @Param('id', ParseIntPipe) galleryId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.imagesService.copyImage(image, galleryId, dto, userId);
  }
}
