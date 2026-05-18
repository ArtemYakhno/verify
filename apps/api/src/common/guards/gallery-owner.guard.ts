import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SafeUser } from '../types/user.types';
import { GalleryAccessService } from '../../galleries/gallery-access.service';

@Injectable()
export class GalleryOwnerGuard implements CanActivate {
  constructor(private readonly galleryAccessService: GalleryAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as SafeUser;

    if (!user) {
      throw new UnauthorizedException();
    }

    const galleryId = Number(request.params.id);

    const gallery = await this.galleryAccessService.getOwnedGalleryOrThrow(
      galleryId,
      user.id,
    );

    request.gallery = gallery;

    return true;
  }
}
