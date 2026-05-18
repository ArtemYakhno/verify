import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RolesDecorator } from './roles.decorator';
import { Role } from '../../../generated/prisma/enums';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    RolesDecorator(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
