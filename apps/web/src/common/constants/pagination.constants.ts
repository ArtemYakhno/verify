export const ORDER_BY_GALLERIES = ["createdAt", "title"] as const;
export const ORDER_DIR = ["asc", "desc"] as const;

export type OrderDir = (typeof ORDER_DIR)[number];
export type OrderByGalleries = (typeof ORDER_BY_GALLERIES)[number];