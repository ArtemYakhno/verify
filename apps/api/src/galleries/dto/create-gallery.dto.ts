import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';

export class CreateGalleryDto {
  @ApiProperty({ example: 'My Travel Photos', minLength: 2, maxLength: 50 })
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN(2) })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX(50) })
  title!: string;

  @ApiPropertyOptional({
    example: 'A collection of my best travel photos',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: VALIDATION_MESSAGES.MAX(255) })
  description?: string;
}
