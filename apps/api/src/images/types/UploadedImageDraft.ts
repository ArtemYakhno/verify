import { ImageInternal } from '../../../common/types/image.types';

export type UploadedImageDraft = Omit<
  ImageInternal,
  'id' | 'galleryId' | 'createdAt' | 'updatedAt'
>;
