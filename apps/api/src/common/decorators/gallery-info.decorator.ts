import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { GalleryDetail } from '../types/gallery.types';

export const GalleryInfo = createParamDecorator(
  (data: keyof GalleryDetail | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const gallery = request.gallery as GalleryDetail;

    return data ? gallery[data] : gallery;
  },
);
