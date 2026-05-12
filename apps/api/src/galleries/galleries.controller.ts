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
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  GalleryDetailResponseDto,
  PaginatedGalleriesDto,
} from './dto/gallery-response.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AUTH_MESSAGES,
  GALLERY_MESSAGES,
} from '../../common/constants/messages.constants';
import { GalleryOwnerGuard } from './guards/gallery-owner.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Gallery } from '../../common/decorators/gallery.decorator';

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
    return this.galleriesService.findAll(query);
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
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard)
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
    @Gallery('id') galleryId: number,
  ) {
    console.log(galleryId);
    return this.galleriesService.update(id, updateGalleryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, GalleryOwnerGuard)
  @ApiOperation({ summary: 'Delete gallery', description: 'owner only' })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.UNAUTHORIZED_DESCRIPTION,
  })
  @ApiForbiddenResponse({ description: GALLERY_MESSAGES.FORBIDDEN })
  @ApiNotFoundResponse({ description: GALLERY_MESSAGES.NOT_FOUND_DESCRIPTION })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.galleriesService.delete(id);
  }
}
