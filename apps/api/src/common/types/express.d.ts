import { Gallery } from './gallery.types';
import { ImageInternal } from './image.types';
import { SafeUser } from './user.types';

declare module 'express' {
  interface Request {
    user?: SafeUser;
    gallery?: Gallery;
    image?: ImageInternal;
  }
}
