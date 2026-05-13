import type { GalleriesQuery } from "../schemas/gallery-query.schema";

export const galleryKeys = {
  default: ["galleries"] as const,
  list: (params?: GalleriesQuery) =>
    params
      ? ([...galleryKeys.default, "list", params] as const)
      : ([...galleryKeys.default, "list"] as const),
  detail: (id: number) => [...galleryKeys.default, "detail", id] as const,
};
