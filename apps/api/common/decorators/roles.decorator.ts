import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { ROLES_KEY_METADATA } from '../constants/metadata.contants';

export const RolesDecorator = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY_METADATA, roles);
