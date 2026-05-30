import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';

export class MoveCopyImageDto {
  @ApiProperty({ description: 'Target gallery ID', example: 2 })
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MESSAGES.IS_INT })
  @IsPositive({ message: VALIDATION_MESSAGES.IS_POSITIVE })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  targetGalleryId!: number;
}
