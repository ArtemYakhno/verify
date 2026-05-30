import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { useGalleriesParams } from "../hooks/useGalleriesParams";
import { useGetGalleries } from "../gueries/gallery.queries";
import { GalleryFooter } from "../blocks/Gallery/GalleryFooter";
import { GalleryList } from "../blocks/Gallery/GalleryList";
import { GalleryPlug } from "../blocks/Gallery/GalleryPlug";
import { GalleryHeader } from "../blocks/Gallery/Header/GalleryHeader";


export const Galleries = () => {
  const { params, setPage, setSearch, setFilters, setPerPage, setSorting, resetFilters } = useGalleriesParams();
  const { page, perPage, orderBy, orderDir, search, createdFrom, createdTo, minImages, maxImages } = params
  const { data, isLoading, isError, error } = useGetGalleries(params);

  const galleries = data?.data ?? [];
  const meta = data?.meta;
  const isEmpty = !isLoading && galleries.length === 0;

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setPage(newPage);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingPlug />;
    if (isError || isEmpty) return <GalleryPlug variant={isError ? "error" : "empty"} error={error} />

    return (
      <>
        <GalleryList galleries={galleries} />

        {meta && (
          <GalleryFooter
            page={page}
            perPage={perPage}
            meta={meta}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  return (
    <>
      <GalleryHeader actions={{
        setSearch,
        setFilters,
        setPerPage,
        setSorting,
        resetFilters,
      }} params={{
        search,
        createdFrom,
        createdTo,
        orderBy,
        orderDir,
        minImages,
        maxImages,
      }}
      />
      {renderContent()}
    </>
  );
};