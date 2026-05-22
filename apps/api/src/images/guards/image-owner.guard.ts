import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Type,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { SafeUser } from '../../common/types/user.types';
import { imageInternalSelect } from '../../common/types/image.types';
import { IMAGE_MESSAGES } from '../../common/constants/messages.constants';
import { Prisma } from '../../../generated/prisma/client';
import type { ResourceState } from '../../common/types/resource-state.type';

const imageOwnerSelect = {
  ...imageInternalSelect,
  gallery: {
    select: {
      userId: true,
    },
  },
} satisfies Prisma.ImageSelect;

export function ImageOwnerGuard(
  state: ResourceState = 'active',
): Type<CanActivate> {
  @Injectable()
  class ImageOwnerGuardMixin implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as SafeUser;

      if (!user) throw new UnauthorizedException();

      const imageId = Number(request.params.imageId);

      const where: Prisma.ImageWhereInput =
        state === 'active'
          ? { id: imageId, deletedAt: null }
          : state === 'deleted'
            ? { id: imageId, deletedAt: { not: null } }
            : { id: imageId };

      const image = await this.prisma.image.findFirst({
        where,
        select: imageOwnerSelect,
      });

      if (!image) {
        throw new NotFoundException(IMAGE_MESSAGES.NOT_FOUND(imageId));
      }

      if (image.gallery.userId !== user.id) {
        throw new ForbiddenException(IMAGE_MESSAGES.FORBIDDEN);
      }

      request.image = image;
      return true;
    }
  }

  return mixin(ImageOwnerGuardMixin);
}
