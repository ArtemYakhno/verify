import { Gallery } from './gallery.types';
import { ImageInternal } from './image.types';
import { User } from './user.types';

declare module 'express' {
  interface Request {
    user?: User;
    gallery?: Gallery;
    image?: ImageInternal;
  }
}
