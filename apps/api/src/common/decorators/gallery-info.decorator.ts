import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Gallery } from '../types/gallery.types';

export const GalleryInfo = createParamDecorator(
  (data: keyof Gallery | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const gallery = request.gallery as Gallery;

    return data ? gallery[data] : gallery;
  },
);
