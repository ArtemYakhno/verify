import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import {
  GalleryDetailResponseDto,
  PaginatedGalleriesDto,
} from './dto/gallery-response.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  AUTH_MESSAGES,
  GALLERY_MESSAGES,
} from '../common/constants/messages.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GalleryOwnerGuard } from '../common/guards/gallery-owner.guard';

@ApiTags('Galleries')
@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all galleries',
    description: 'auth required, paginated',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedGalleriesDto })
  findAll(@Query() query: PaginationQueryDto) {
    return this.galleriesService.findPart(query);
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get gallery by id', description: 'auth required' })
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.galleriesService.findById(id);
  }

  @Get('deleted')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @ApiOperation({ summary: 'Get deleted gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  findDeleted(@CurrentUser('id') userId: number) {
    return this.galleriesService.findDeleted(userId);
  }

  @Post()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new gallery',
    description: 'auth required',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: GalleryDetailResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  create(
    @CurrentUser('id') userId: number,
    @Body() createGalleryDto: CreateGalleryDto,
  ) {
    return this.galleriesService.create(userId, createGalleryDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @ApiOperation({ summary: 'Update gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    return this.galleriesService.update(id, updateGalleryDto);
  }

  @Patch(':id/soft-delete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('active'))
  @ApiOperation({ summary: 'Soft delete gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.galleriesService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('deleted'))
  @ApiOperation({ summary: 'Restore gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: GalleryDetailResponseDto })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.galleriesService.restore(id);
  }

  @Delete(':id/purge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard('deleted'))
  @ApiOperation({ summary: 'Purge gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  purge(@Param('id', ParseIntPipe) id: number) {
    return this.galleriesService.purge(id);
  }
}
