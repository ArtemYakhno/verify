import type { InputImagesQuery } from "../schemas/image-query.schema";

export const imageKeys = {
  default: ["images"] as const,

  byGallery: (galleryId: number) =>
    [...imageKeys.default, "gallery", galleryId] as const,

  list: (galleryId: number, params?: InputImagesQuery) =>
    params
      ? ([...imageKeys.byGallery(galleryId), "list", params] as const)
      : ([...imageKeys.byGallery(galleryId), "list"] as const),

  my: (galleryId: number) => [...imageKeys.byGallery(galleryId), "my"] as const,
};
