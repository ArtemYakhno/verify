import type { ImagesQuery } from "../schemas/image-query.schema";

export const imageKeys = {
  default: ["images"] as const,

  byGallery: (galleryId: number) =>
    [...imageKeys.default, "gallery", galleryId] as const,

  list: (galleryId: number, params?: ImagesQuery) =>
    params
      ? ([...imageKeys.byGallery(galleryId), "list", params] as const)
      : ([...imageKeys.byGallery(galleryId), "list"] as const),

  all: (galleryId: number) =>
    [...imageKeys.byGallery(galleryId), "all"] as const,
};
