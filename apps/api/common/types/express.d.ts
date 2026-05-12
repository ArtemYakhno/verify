import { GalleryDetail } from './gallery.types';
import { SafeUser } from './user.types';

declare module 'express' {
  interface Request {
    user?: SafeUser;
    gallery?: GalleryDetail;
  }
}
