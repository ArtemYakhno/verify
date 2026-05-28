import { useSearchParams } from "react-router-dom";
import { getSearchWith } from "@/common/utils/searchHelper";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 18;

export const useGalleryImagesParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;

  const setPage = (newPage: number) => {
    setSearchParams(
      getSearchWith(searchParams, {
        page: newPage === DEFAULT_PAGE ? null : String(newPage),
      }),
      { preventScrollReset: false },
    );
  };

  return {
    page,
    perPage,
    setPage,
  };
};
