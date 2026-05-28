import { getSearchWith } from "@/common/utils/searchHelper";
import { useSearchParams } from "react-router-dom";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 12;

export const useGalleriesParams = () => {
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

  return { page, perPage, setPage };
};
