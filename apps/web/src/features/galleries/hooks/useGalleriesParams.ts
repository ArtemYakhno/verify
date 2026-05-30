import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  galleriesQuerySchema,
  type GalleriesQuery,
  type InputGalleriesQuery,
} from "../schemas/gallery-query.schema";
import {
  getSearchWith,
  normalizeParam,
  searchParamsToObject,
} from "@/common/utils/search/searchHelper";
import {
  DEFAULT_GALLERY_ORDER_BY,
  DEFAULT_ORDER_DIR,
  DEFAULT_PAGE,
  GALLERY_IMAGES_COUNT_MAX,
  GALLERY_IMAGES_COUNT_MIN,
  type OrderByGalleries,
  type OrderDir,
} from "@/common/constants/pagination.constants";
import type { GalleryFilterQuery } from "../types/gallery-filter-query";

const DEFAULT_GALLERY_PER_PAGE = 12;

export const useGalleriesParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<GalleriesQuery>(() => {
    const result = galleriesQuerySchema.safeParse(
      searchParamsToObject(searchParams),
    );
    return result.success ? result.data : galleriesQuerySchema.parse({});
  }, [searchParams]);

  const updateParams = (
    updates: InputGalleriesQuery,
    options?: { resetPage?: boolean },
  ) => {
    setSearchParams(
      (currentSearchParams) => {
        const nextParams = getSearchWith(currentSearchParams, {
          ...(options?.resetPage ? { page: null } : {}),
          ...(updates.page !== undefined && !options?.resetPage
            ? { page: normalizeParam(updates.page, DEFAULT_PAGE) }
            : {}),
          perPage: normalizeParam(updates.perPage, DEFAULT_GALLERY_PER_PAGE),
          orderDir: normalizeParam(updates.orderDir, DEFAULT_ORDER_DIR),
          orderBy: normalizeParam(updates.orderBy, DEFAULT_GALLERY_ORDER_BY),
          search: normalizeParam(updates.search),
          createdFrom: normalizeParam(updates.createdFrom),
          createdTo: normalizeParam(updates.createdTo),
          minImages: normalizeParam(
            updates.minImages,
            GALLERY_IMAGES_COUNT_MIN,
          ),
          maxImages: normalizeParam(
            updates.maxImages,
            GALLERY_IMAGES_COUNT_MAX,
          ),
        });

        if (nextParams.toString() === currentSearchParams.toString()) {
          return currentSearchParams;
        }

        return nextParams;
      },
      { preventScrollReset: false },
    );
  };

  const setPage = (page: number) => updateParams({ ...params, page });

  const setPerPage = (perPage: number) =>
    updateParams({ ...params, perPage }, { resetPage: true });

  const setSearch = (search: string) =>
    updateParams({ ...params, search }, { resetPage: true });

  const setSorting = (orderBy: OrderByGalleries, orderDir: OrderDir) => {
    updateParams({ ...params, orderBy, orderDir }, { resetPage: true });
  };

  const setFilters = (filters: GalleryFilterQuery) =>
    updateParams({ ...params, ...filters }, { resetPage: true });

  const resetFilters = () => {
    updateParams(
      {
        ...params,
        createdFrom: null,
        createdTo: null,
        minImages: null,
        maxImages: null,
      },
      { resetPage: true },
    );
  };

  return {
    params: { ...params },
    setPage,
    setPerPage,
    setSearch,
    setSorting,
    setFilters,
    resetFilters,
    updateParams,
  };
};
