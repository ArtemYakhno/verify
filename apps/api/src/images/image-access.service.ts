import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { ResourceState } from '../common/types/resource-state.type';
import { User } from '../common/types/user.types';
import { IMAGE_MESSAGES } from '../common/constants/messages.constants';
import { ImagesService } from './images.service';

@Injectable()
export class ImageAccessService {
  constructor(private readonly imagesService: ImagesService) {}

  async getAccessibleImageOrThrow(
    imageId: number,
    user: User,
    state: ResourceState = 'active',
  ) {
    const image = await this.imagesService.findById(imageId, state);

    if (user.role !== Role.ADMIN && image.gallery.userId !== user.id) {
      throw new ForbiddenException(IMAGE_MESSAGES.FORBIDDEN);
    }

    return image;
  }
}
