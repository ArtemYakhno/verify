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
import { GalleryAccessService } from '../../galleries/gallery-access.service';
import { ResourceState } from '../types/resource-state.type';

export function GalleryAccessGuard(
  state: ResourceState = 'active',
): Type<CanActivate> {
  @Injectable()
  class GalleryAccessGuardMixin implements CanActivate {
    constructor(private readonly galleryAccessService: GalleryAccessService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as User;

      if (!user) {
        throw new UnauthorizedException();
      }

      const galleryId = Number(request.params.galleryId);

      const gallery =
        await this.galleryAccessService.getAccessibleGalleryOrThrow(
          galleryId,
          user,
          state,
        );

      request.gallery = gallery;

      return true;
    }
  }

  return mixin(GalleryAccessGuardMixin);
}
