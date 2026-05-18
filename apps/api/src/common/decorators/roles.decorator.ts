import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY_METADATA } from '../constants/metadata.constants';
import { Role } from '../../../generated/prisma/enums';

export const RolesDecorator = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY_METADATA, roles);
