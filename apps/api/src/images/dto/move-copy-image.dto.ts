import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class MoveCopyImageDto {
  @ApiProperty({ description: 'Target gallery ID', example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  targetGalleryId!: number;
}
