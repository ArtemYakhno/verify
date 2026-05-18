import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ImageInternal } from '../types/image.types';

export const ImageInfo = createParamDecorator(
  (data: keyof ImageInternal | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const gallery = request.image as ImageInternal;

    return data ? gallery[data] : gallery;
  },
);
