import { GalleryDetail } from './gallery.types';
import { Image } from './image.types';
import { SafeUser } from './user.types';

declare module 'express' {
  interface Request {
    user?: SafeUser;
    gallery?: GalleryDetail;
    image?: Image;
  }
}
