import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  meta!: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
