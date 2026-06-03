import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class ImageResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() path!: string;
  @ApiProperty() galleryId!: number;
  @ApiProperty() originalFilename!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) comment!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedImagesDto {
  @ApiProperty({ type: [ImageResponseDto] })
  data!: ImageResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
