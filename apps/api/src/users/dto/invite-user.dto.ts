import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class InviteUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @ApiPropertyOptional({ enum: Role, default: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.USER;
}
