import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseGalleryResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  description!: string | null;

  @ApiProperty()
  userId!: number;
}

export class GalleryListResponseDto extends BaseGalleryResponseDto {}

export class GalleryDetailResponseDto extends BaseGalleryResponseDto {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginationMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  hasNextPage!: boolean;

  @ApiProperty()
  hasPreviousPage!: boolean;
}

export class PaginatedGalleriesDto {
  @ApiProperty({ type: [GalleryListResponseDto] })
  data!: GalleryListResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
