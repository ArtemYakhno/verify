import { z } from "zod";
import {
  DEFAULT_GALLERY_ORDER_BY,
  GALLERY_IMAGES_COUNT_MAX,
  GALLERY_IMAGES_COUNT_MIN,
  ORDER_BY_GALLERIES,
} from "@/common/constants/pagination.constants";
import { basePaginationQuerySchema } from "@/common/schemas/paginationQuery.schema";
import {
  createIntRangeQuerySchema,
  createSortingQuerySchema,
  optionalDateQuerySchema,
  optionalStringQuerySchema,
} from "@/common/schemas/query-primitives.schema";
import type { Nullable } from "@/common/types/Nullable";

export const galleriesQuerySchema = z.object({
  ...basePaginationQuerySchema.shape,
  ...createSortingQuerySchema(ORDER_BY_GALLERIES, DEFAULT_GALLERY_ORDER_BY)
    .shape,
  search: optionalStringQuerySchema,
  createdFrom: optionalDateQuerySchema,
  createdTo: optionalDateQuerySchema,
  minImages: createIntRangeQuerySchema(
    GALLERY_IMAGES_COUNT_MIN,
    GALLERY_IMAGES_COUNT_MAX,
    GALLERY_IMAGES_COUNT_MIN,
  ),
  maxImages: createIntRangeQuerySchema(
    GALLERY_IMAGES_COUNT_MIN,
    GALLERY_IMAGES_COUNT_MAX,
    GALLERY_IMAGES_COUNT_MAX,
  ),
});

export type GalleriesQuery = z.output<typeof galleriesQuerySchema>;

export type InputGalleriesQuery = {
  [K in keyof GalleriesQuery]?: Nullable<GalleriesQuery[K]>;
};
