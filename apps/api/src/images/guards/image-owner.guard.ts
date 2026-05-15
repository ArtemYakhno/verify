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
import { PrismaService } from '../../prisma/prisma.service';
import { IMAGE_MESSAGES } from '../../../common/constants/messages.constants';
import { imageInternalSelect } from '../../../common/types/image.types';

@Injectable()
export class ImageOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as SafeUser;

    if (!user) throw new UnauthorizedException();

    const imageId = Number(request.params.imageId);

    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      select: {
        ...imageInternalSelect,
        gallery: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!image) throw new NotFoundException(IMAGE_MESSAGES.NOT_FOUND(imageId));

    if (image.gallery.userId !== user.id) {
      throw new ForbiddenException(IMAGE_MESSAGES.FORBIDDEN);
    }

    request.image = image;

    return true;
  }
}
