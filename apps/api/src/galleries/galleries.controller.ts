import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  HttpStatus,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import {
  GalleryDetailResponseDto,
  GalleryListResponseDto,
  PaginatedGalleriesDto,
} from './dto/gallery-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FindAllGalleriesQueryDto } from './dto/find-all-galleries-query.dto';
import { GalleryInfo } from '../common/decorators/gallery-info.decorator';
import {
  ApiGalleryIdParam,
  GalleryAccess,
  GalleryLimitImages,
  GalleryNotFound,
  GalleryPaginationValidation,
  GalleryValidation,
} from './decorators/galleries-swagger.decorator';
import { Role } from '../../generated/prisma/enums';
import { Auth } from '../common/decorators/auth.decorator';
import { UserExistsPipe } from '../common/pipes/user-exist.pipe';
import { ApiUserIdParam } from '../users/decorators/user-swagger.decorator';

@ApiTags('Galleries')
@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get all active galleries',
    description: 'auth required, paginated',
  })
  @GalleryPaginationValidation()
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedGalleriesDto })
  findPart(@Query() query: FindAllGalleriesQueryDto) {
    return this.galleriesService.findPart(query);
  }

  @Get('my')
  @Auth()
  @ApiOperation({
    summary: 'Get my active galleries',
    description: 'auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [GalleryListResponseDto] })
  findMyAll(@CurrentUser('id') userId: number) {
    return this.galleriesService.findAllByUser(userId);
  }

  @Get('my/deleted')
  @Auth()
  @ApiOperation({
    summary: 'Get my deleted galleries',
    description: 'auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [GalleryListResponseDto] })
  findMyDeleted(@CurrentUser('id') userId: number) {
    return this.galleriesService.findDeletedByUser(userId);
  }

  @Get('user/:userId')
  @Auth(Role.ADMIN)
  @ApiUserIdParam()
  @ApiOperation({
    summary: 'Get active galleries by user id',
    description: 'admin only, auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [GalleryDetailResponseDto] })
  findAllByUser(@Param('userId', ParseIntPipe, UserExistsPipe) userId: number) {
    return this.galleriesService.findAllByUser(userId);
  }

  @Get('user/:userId/deleted')
  @Auth(Role.ADMIN)
  @ApiUserIdParam()
  @ApiOperation({
    summary: 'Get deleted galleries by user id',
    description: 'admin only, auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [GalleryDetailResponseDto] })
  findDeletedByUser(
    @Param('userId', ParseIntPipe, UserExistsPipe) userId: number,
  ) {
    return this.galleriesService.findDeletedByUser(userId);
  }

  @Get(':galleryId')
  @Auth()
  @ApiOperation({
    summary: 'Get active gallery by id',
    description: 'auth required',
  })
  @ApiGalleryIdParam()
  @GalleryNotFound()
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  findById(@Param('galleryId', ParseIntPipe) galleryId: number) {
    return this.galleriesService.findById(galleryId);
  }

  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Create a new gallery',
    description: 'auth required',
  })
  @GalleryValidation()
  @ApiResponse({ status: HttpStatus.CREATED, type: GalleryDetailResponseDto })
  create(
    @CurrentUser('id') userId: number,
    @Body() createGalleryDto: CreateGalleryDto,
  ) {
    return this.galleriesService.create(userId, createGalleryDto);
  }

  @Post('user/:userId')
  @Auth(Role.ADMIN)
  @ApiUserIdParam()
  @GalleryValidation()
  @ApiOperation({
    summary: 'Create gallery for user',
    description: 'admin only, auth required',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: GalleryDetailResponseDto })
  createForUser(
    @Param('userId', ParseIntPipe, UserExistsPipe) userId: number,
    @Body() dto: CreateGalleryDto,
  ) {
    return this.galleriesService.create(userId, dto);
  }

  @Patch(':galleryId')
  @GalleryAccess('active')
  @ApiOperation({
    summary: 'Update gallery',
    description: 'owner or admin, auth required',
  })
  @GalleryValidation()
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  update(
    @GalleryInfo('id') id: number,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    return this.galleriesService.update(id, updateGalleryDto);
  }

  @Patch(':galleryId/soft-delete')
  @GalleryAccess('active')
  @ApiOperation({
    summary: 'Soft delete gallery',
    description: 'owner or admin, auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  softDelete(@GalleryInfo('id') id: number) {
    return this.galleriesService.softDelete(id);
  }

  @Delete(':galleryId/purge')
  @GalleryAccess('deleted')
  @ApiOperation({
    summary: 'Purge gallery',
    description: 'owner or admin, auth required',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  purge(@GalleryInfo('id') id: number) {
    return this.galleriesService.purge(id);
  }

  @Patch(':galleryId/restore')
  @GalleryAccess('deleted')
  @ApiOperation({
    summary: 'Restore gallery',
    description: 'owner or admin, auth required',
  })
  @GalleryLimitImages()
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  restore(@GalleryInfo('id') id: number) {
    return this.galleriesService.restore(id);
  }
}
