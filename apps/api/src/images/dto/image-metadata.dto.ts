import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/constants/validation.constants';

export class ImageMetadataDto {
  @ApiPropertyOptional({ nullable: true, example: 'Artem' })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX(50) })
  name?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Conference photo' })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MaxLength(100, { message: VALIDATION_MESSAGES.MAX(100) })
  comment?: string | null;
}
