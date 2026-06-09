import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

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

export class GalleryImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  path!: string;
}

export class GalleryListResponseDto extends BaseGalleryResponseDto {
  @ApiProperty({
    type: [GalleryImageResponseDto],
  })
  images!: GalleryImageResponseDto[];
}

export class GalleryDetailResponseDto extends BaseGalleryResponseDto {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedGalleriesDto {
  @ApiProperty({ type: [GalleryListResponseDto] })
  data!: GalleryListResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
