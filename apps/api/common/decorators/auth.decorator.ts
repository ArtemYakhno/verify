import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Role } from '../../generated/prisma/enums';
import { RolesGuard } from '../guards/roles.guard';
import { RolesDecorator } from './roles.decorator';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    RolesDecorator(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
