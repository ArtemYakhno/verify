import {
  getSearchWith,
  normalizeParam,
  searchParamsToObject,
} from "@/common/utils/search/searchHelper";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  imagesQuerySchema,
  type ImagesQuery,
  type InputImagesQuery,
} from "../schemas/image-query.schema";
import {
  DEFAULT_IMAGE_ORDER_BY,
  DEFAULT_ORDER_DIR,
  DEFAULT_PAGE,
} from "@/common/constants/pagination.constants";

const DEFAULT_IMAGE_PER_PAGE = 12;

export const useGalleryImagesParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<ImagesQuery>(() => {
    const result = imagesQuerySchema.safeParse(
      searchParamsToObject(searchParams),
    );
    return result.success ? result.data : imagesQuerySchema.parse({});
  }, [searchParams]);

  const updateParams = (
    updates: InputImagesQuery,
    options?: { resetPage?: boolean },
  ) => {
    setSearchParams(
      getSearchWith(searchParams, {
        ...(options?.resetPage ? { page: null } : {}),
        page: normalizeParam(updates.page, DEFAULT_PAGE),
        perPage: normalizeParam(updates.perPage, DEFAULT_IMAGE_PER_PAGE),
        orderDir: normalizeParam(updates.orderDir, DEFAULT_ORDER_DIR),
        orderBy: normalizeParam(updates.orderBy, DEFAULT_IMAGE_ORDER_BY),
      }),
      { preventScrollReset: false },
    );
  };

  const setPage = (page: number) => updateParams({ page });

  return {
    params: { ...params },
    setPage,
  };
};
