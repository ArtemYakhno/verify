import type { InputGalleriesQuery } from "../schemas/gallery-query.schema";

export const galleryKeys = {
  all: ["galleries"] as const,

  lists: () => [...galleryKeys.all, "list"] as const,
  list: (params?: InputGalleriesQuery) =>
    params
      ? ([...galleryKeys.lists(), params] as const)
      : ([...galleryKeys.lists()] as const),

  details: () => [...galleryKeys.all, "detail"] as const,
  detail: (id: number) => [...galleryKeys.details(), id] as const,

  my: () => [...galleryKeys.all, "my"] as const,
};
