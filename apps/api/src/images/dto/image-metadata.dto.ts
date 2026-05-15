import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ImageMetadataDto {
  @ApiPropertyOptional({ nullable: true, example: 'Artem' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Conference photo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comment?: string | null;
}
