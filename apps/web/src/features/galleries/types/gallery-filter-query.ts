import type { InputGalleriesQuery } from "../schemas/gallery-query.schema";

export type GalleryFilterQuery = Pick<
  InputGalleriesQuery,
  "createdFrom" | "createdTo" | "minImages" | "maxImages"
>;
