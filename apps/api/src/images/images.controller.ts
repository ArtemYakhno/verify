import {
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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { MoveCopyImageDto } from './dto/move-copy-image.dto';
import { ImageResponseDto, PaginatedImagesDto } from './dto/image-response.dto';
import { ImageMetadataDto } from './dto/image-metadata.dto';
import { GalleryInfo } from '../common/decorators/gallery-info.decorator';
import { Auth } from '../common/decorators/auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ImageInfo } from '../common/decorators/image-info.decorator';
import type { ImageInternal } from '../common/types/image.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Gallery } from '../common/types/gallery.types';
import type { User } from '../common/types/user.types';
import {
  ApiGalleryIdParam,
  GalleryAccess,
  GalleryNotFound,
} from '../galleries/decorators/galleries-swagger.decorator';
import { GalleryExistsPipe } from '../common/pipes/gallery-exist.pipe';
import {
  ImageAccess,
  ImageCountConflicts,
  MoveCopyConflicts,
  MoveCopyValidation,
  UploadImage,
} from './decorators/images-swagger.decorator';
import { ApiBadRequestError } from '../common/decorators/swagger.decorator';
import { BASE_PAGINATION_VALIDATION_ERRORS } from '../common/constants/validation.constants';

@ApiTags('Images')
@Controller('galleries/:galleryId/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get active images by gallery',
    description: 'paginated, auth required',
  })
  @Auth()
  @ApiGalleryIdParam()
  @ApiBadRequestError(BASE_PAGINATION_VALIDATION_ERRORS)
  @GalleryNotFound()
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedImagesDto })
  findPartByGallery(
    @Param('galleryId', ParseIntPipe, GalleryExistsPipe) galleryId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.imagesService.findPartByGallery(galleryId, query);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get all my active images by gallery for editing',
    description: 'owner only, no pagination, auth required',
  })
  @GalleryAccess('active')
  @ApiResponse({ status: HttpStatus.OK, type: [ImageResponseDto] })
  findMyByGallery(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.findAllByGallery(galleryId);
  }

  @Get('deleted')
  @GalleryAccess()
  @ApiOperation({
    summary: 'Get deleted image',
    description: 'owner/admin only, auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  findMyDeleted(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.findDeletedByGallery(galleryId);
  }

  @Post()
  @ApiOperation({
    summary: 'Upload single image to gallery (owner/admin only)',
  })
  @GalleryAccess('active')
  @UploadImage()
  @ImageCountConflicts()
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDto })
  uploadImage(
    @GalleryInfo() gallery: Gallery,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageMetadataDto,
  ) {
    return this.imagesService.uploadImage(gallery, file, dto);
  }

  @Patch('soft-delete-all')
  @ApiOperation({
    summary: 'Soft delete all images in gallery (owner/admin only)',
  })
  @GalleryAccess('active')
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  softDeleteAll(@GalleryInfo('id') galleryId: number) {
    return this.imagesService.softDeleteAll(galleryId);
  }

  @Patch(':imageId')
  @ApiOperation({
    summary: 'Update image metadata auth + gallery owner + image owner',
  })
  @ImageAccess('active', 'active')
  updateMetadata(
    @ImageInfo('id') imageId: number,
    @Body() dto: ImageMetadataDto,
  ) {
    return this.imagesService.updateMetadata(imageId, dto);
  }

  @Patch(':imageId/soft-delete')
  @ApiOperation({ summary: 'Soft delete image (owner only)' })
  @ImageAccess('active', 'active')
  @ImageCountConflicts()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  softDelete(@ImageInfo() image: ImageInternal) {
    return this.imagesService.softDelete(image);
  }

  @Patch(':imageId/move')
  @ApiOperation({ summary: 'Move image to another gallery (owner only)' })
  @ImageAccess('active', 'active')
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  @MoveCopyValidation()
  @MoveCopyConflicts()
  move(
    @ImageInfo('id') imageId: number,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @Body() dto: MoveCopyImageDto,
    @CurrentUser() user: User,
  ) {
    return this.imagesService.move(imageId, galleryId, dto, user);
  }

  @Post(':imageId/copy')
  @ApiOperation({ summary: 'Copy image to another gallery (owner only)' })
  @ImageAccess('active', 'active')
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  @MoveCopyValidation()
  @MoveCopyConflicts()
  copy(
    @ImageInfo() image: ImageInternal,
    @Body() dto: MoveCopyImageDto,
    @Param('galleryId', ParseIntPipe) galleryId: number,
    @CurrentUser() user: User,
  ) {
    return this.imagesService.copy(image, galleryId, dto, user);
  }

  @Delete(':imageId/purge')
  @ApiOperation({ summary: 'Permanently delete image (owner only)' })
  @ImageAccess('active', 'deleted')
  @ImageCountConflicts()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  purge(@ImageInfo() image: ImageInternal) {
    return this.imagesService.purge(image);
  }

  @Patch(':imageId/restore')
  @ApiOperation({ summary: 'Restore deleted image (owner only)' })
  @ImageAccess('active', 'deleted')
  @ApiResponse({ status: HttpStatus.OK, type: ImageResponseDto })
  restore(@ImageInfo() image: ImageInternal) {
    return this.imagesService.restore(image);
  }
}
