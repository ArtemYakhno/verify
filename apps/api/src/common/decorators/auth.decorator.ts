import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RolesDecorator } from './roles.decorator';
import { Role } from '../../../generated/prisma/enums';
import { ApiAuth, ApiAuthRole } from './swagger.decorator';

export function Auth(...roles: Role[]) {
  const apiDoc = roles.length > 0 ? ApiAuthRole() : ApiAuth();

  return applyDecorators(
    apiDoc,
    RolesDecorator(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
