import { MAX_FILES } from "@/features/images/constants/image.constants";

export const ORDER_BY_GALLERIES = [
  "createdAt",
  "title",
  "imagesCount",
] as const;
export const ORDER_BY_IMAGES = ["createdAt"] as const;
export const ORDER_DIR = ["asc", "desc"] as const;

export type OrderDir = (typeof ORDER_DIR)[number];
export type OrderByGalleries = (typeof ORDER_BY_GALLERIES)[number];
export type OrderByImages = (typeof ORDER_BY_IMAGES)[number];

export const DEFAULT_ORDER_DIR = "desc";
export const DEFAULT_PAGE = 1;
export const DEFAULT_GALLERY_ORDER_BY = "createdAt";
export const DEFAULT_IMAGE_ORDER_BY = "createdAt";
export const GALLERY_IMAGES_COUNT_MIN = 0;
export const GALLERY_IMAGES_COUNT_MAX = MAX_FILES;
