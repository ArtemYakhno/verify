import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SafeUser } from '../../../common/types/user.types';
import { GALLERY_MESSAGES } from '../../../common/constants/messages.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { galleryDetailSelect } from '../../../common/types/gallery.types';

@Injectable()
export class GalleryOwnerGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as SafeUser;

    if (!user) {
      throw new UnauthorizedException();
    }

    const galleryId = Number(request.params.id);

    const gallery = await this.prismaService.gallery.findUnique({
      where: { id: galleryId },
      select: galleryDetailSelect,
    });

    if (!gallery) {
      throw new NotFoundException(GALLERY_MESSAGES.NOT_FOUND(galleryId));
    }

    if (gallery.userId !== user.id) {
      throw new ForbiddenException(GALLERY_MESSAGES.FORBIDDEN);
    }

    request.gallery = gallery;

    return true;
  }
}
