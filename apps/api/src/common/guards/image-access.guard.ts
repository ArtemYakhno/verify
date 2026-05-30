import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../types/user.types';

import type { ResourceState } from '../types/resource-state.type';
import { ImageAccessService } from '../../images/image-access.service';

export function ImageAccessGuard(
  state: ResourceState = 'active',
): Type<CanActivate> {
  @Injectable()
  class ImageAccessGuardMixin implements CanActivate {
    constructor(private readonly imageAccessService: ImageAccessService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as User;

      if (!user) throw new UnauthorizedException();

      const imageId = Number(request.params.imageId);

      const image = await this.imageAccessService.getAccessibleImageOrThrow(
        imageId,
        user,
        state,
      );

      request.image = image;
      return true;
    }
  }

  return mixin(ImageAccessGuardMixin);
}
