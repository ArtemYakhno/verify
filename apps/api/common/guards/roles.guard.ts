import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums';
import { ROLES_KEY_METADATA } from '../constants/metadata.contants';
import { AUTH_MESSAGES } from '../constants/messages.constants';
import { SafeUser } from '../types/user.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user: SafeUser }>();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(AUTH_MESSAGES.FORBIDDEN_MESSAGE);
    }

    return true;
  }
}
