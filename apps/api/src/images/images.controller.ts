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
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

import { STATUS_CODES } from 'node:http';
import { ImageMetadataDto } from './dto/image-metadata.dto';
import { GalleryOwnerGuard } from '../common/guards/gallery-owner.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AUTH_MESSAGES,
  GALLERY_MESSAGES,
  IMAGE_MESSAGES,
} from '../common/constants/messages.constants';
import { GalleryInfo } from '../common/decorators/gallery-info.decorator';
import { Auth } from '../common/decorators/auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MulterExceptionFilter } from '../common/filters/multer-exception-filter';
import { ImageInfo } from '../common/decorators/image-info.decorator';
import type { ImageInternal } from '../common/types/image.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ALLOWED_IMAGES_TYPES,
  MAX_FILE_SIZE,
} from '../common/constants/limits.constants';
import { ImageOwnerGuard } from './guards/image-owner.guard';
import type { Gallery } from '../common/types/gallery.types';

@ApiTags('Images')
@Controller('galleries/:id/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  //get all for gallery (no pagination, for edit) *******************

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
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

  //get paginated ************

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
    @Param('id', ParseIntPipe) galleryId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.imagesService.findPartByGallery(galleryId, query);
  }

  //Upload ***************

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
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
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
        name: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          example: 'John Snow',
        },
        comment: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          example: 'Conference photo',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiOperation({ summary: 'Upload single image to gallery (owner only)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDto })
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
          noFile: {
            summary: 'No file uploaded',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.NO_FILES,
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
            summary: 'File too large',
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: IMAGE_MESSAGES.LIMIT_FILE_SIZE,
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
    @GalleryInfo() gallery: Gallery,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: ImageMetadataDto,
  ) {
    if (!file) {
      throw new BadRequestException(IMAGE_MESSAGES.NO_FILES);
    }

    return this.imagesService.uploadImage(gallery, file, dto);
  }

  @Patch('soft-delete-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @ApiOperation({ summary: 'Soft delete all images in gallery (owner only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  softDeleteAll(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.softDeleteAll(galleryId);
  }

  //update metadata *****************

  @Patch(':imageId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('active'))
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

  //SoftDelete

  @Patch(':imageId/soft-delete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('active'))
  @ApiOperation({ summary: 'Soft delete image (owner only)' })
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
  softDelete(@ImageInfo() image: ImageInternal) {
    return this.imagesService.softDelete(image);
  }

  //move ******************

  @Patch(':imageId/move')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('active'))
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
    return this.imagesService.move(imageId, galleryId, dto, userId);
  }

  //copy *****************

  @Post(':imageId/copy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('active'))
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
    return this.imagesService.copy(image, galleryId, dto, userId);
  }

  //restore ****************

  @Patch(':imageId/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('deleted'))
  @ApiOperation({ summary: 'Restore deleted image (owner only)' })
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
  @ApiNotFoundResponse({ description: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: IMAGE_MESSAGES.FORBIDDEN })
  restore(@ImageInfo('id') imageId: number) {
    return this.imagesService.restore(imageId);
  }

  // deleted images ***********

  @Get('deleted')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @ApiOperation({ summary: 'Get deleted image (owner only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
    description: 'Gallery id',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiNotFoundResponse({ description: IMAGE_MESSAGES.NOT_FOUND_DESCRIPTION })
  @ApiForbiddenResponse({ description: IMAGE_MESSAGES.FORBIDDEN })
  getDeletedImage(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.findDeleted(galleryId);
  }

  //purge *****************

  @Delete(':imageId/purge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ImageOwnerGuard('deleted'))
  @ApiOperation({ summary: 'Permanently delete image (owner only)' })
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
  purge(@ImageInfo() image: ImageInternal) {
    return this.imagesService.purge(image);
  }
}
