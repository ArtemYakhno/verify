import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';
import { GalleryOrderBy } from '../types/gallery-order-by.type';
import {
  IsLessThanOrEqual,
  IsLessThanOrEqualDate,
} from '../../common/decorators/is-less-than-or-equal.decorator';
import { IsDateOnOrAfter } from '../../common/decorators/is-date-on-or-after.decorator';
import { IsDateOnOrBefore } from '../../common/decorators/is-date-on-or-before.decorator';
import {
  MAX_IMAGES_PER_GALLERY,
  MIN_IMAGES_PER_GALLERY,
} from '../../common/constants/limits.constants';

export class GalleriesFiltersDto {
  @ApiPropertyOptional({
    description: 'Search by gallery title',
    example: 'summer',
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX(50) })
  search?: string;

  @ApiPropertyOptional({
    description: 'Created from date (inclusive)',
    example: '2025-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: VALIDATION_MESSAGES.IS_DATE })
  @IsDateOnOrAfter(new Date('2000-01-01T00:00:00.000Z'), {
    message: VALIDATION_MESSAGES.MIN_DATE('2000-01-01'),
  })
  @IsDateOnOrBefore(() => new Date(), {
    message: VALIDATION_MESSAGES.MAX_DATE('today'),
  })
  @IsLessThanOrEqualDate('createdTo', {
    message: VALIDATION_MESSAGES.DATE_ORDER('createdFrom', 'createdTo'),
  })
  createdFrom?: Date;

  @ApiPropertyOptional({
    description: 'Created to date (inclusive)',
    example: '2025-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: VALIDATION_MESSAGES.IS_DATE })
  @IsDateOnOrAfter(new Date('2000-01-01T00:00:00.000Z'), {
    message: VALIDATION_MESSAGES.MIN_DATE('2000-01-01'),
  })
  @IsDateOnOrBefore(() => new Date(), {
    message: VALIDATION_MESSAGES.MAX_DATE('today'),
  })
  createdTo?: Date;

  @ApiPropertyOptional({
    description: 'Minimum number of images in gallery',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MESSAGES.IS_INT })
  @Min(0, { message: VALIDATION_MESSAGES.MIN(MIN_IMAGES_PER_GALLERY) })
  @Max(50, { message: VALIDATION_MESSAGES.MAX(MAX_IMAGES_PER_GALLERY) })
  @IsLessThanOrEqual('maxImages', {
    message: VALIDATION_MESSAGES.IMAGE_COUNT,
  })
  minImages?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of images in gallery',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MESSAGES.IS_INT })
  @Min(0, { message: VALIDATION_MESSAGES.MIN(MIN_IMAGES_PER_GALLERY) })
  @Max(50, { message: VALIDATION_MESSAGES.MAX(MAX_IMAGES_PER_GALLERY) })
  maxImages?: number;

  @ApiPropertyOptional({
    enum: GalleryOrderBy,
    default: GalleryOrderBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(GalleryOrderBy, {
    message: VALIDATION_MESSAGES.IS_IN(Object.values(GalleryOrderBy)),
  })
  orderBy: GalleryOrderBy = GalleryOrderBy.CREATED_AT;
}

export class FindAllGalleriesQueryDto extends IntersectionType(
  PaginationQueryDto,
  GalleriesFiltersDto,
) {}
