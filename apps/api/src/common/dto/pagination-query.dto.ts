import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { VALIDATION_MESSAGES } from '../constants/validation.constants';
import { SortDirection } from '../types/sort-direction.types';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MESSAGES.IS_INT })
  @Min(1, { message: VALIDATION_MESSAGES.MIN(1) })
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MESSAGES.IS_INT })
  @Min(1, { message: VALIDATION_MESSAGES.MIN(1) })
  @Max(50, { message: VALIDATION_MESSAGES.MAX(50) })
  perPage: number = 10;

  @ApiPropertyOptional({
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection, {
    message: VALIDATION_MESSAGES.IS_IN(Object.values(SortDirection)),
  })
  orderDir: SortDirection = SortDirection.DESC;
}
