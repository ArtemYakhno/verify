import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { useGalleriesParams } from "../hooks/useGalleriesParams";
import { useGetGalleries } from "../gueries/gallery.queries";
import { GalleryFooter } from "../blocks/Gallery/GalleryFooter";
import { GalleryList } from "../blocks/Gallery/GalleryList";
import { useRef } from "react";
import { GalleryPlug } from "../blocks/Gallery/GalleryPlug";


export const Galleries = () => {
  const { page, perPage, setPage } = useGalleriesParams();

  const { data, isLoading, isError, error } = useGetGalleries({ page, perPage });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const galleries = data?.data ?? [];
  const meta = data?.meta;
  const isEmpty = !isLoading && galleries.length === 0;

  const handlePageChange = (newPage: number) => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    setPage(newPage);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingPlug />;
    if (isError || isEmpty) return <GalleryPlug variant={isError ? "error" : "empty"} error={error} />

    return (
      <>
        <div ref={scrollRef} className="flex-1 min-h-0 lg:overflow-y-auto p-4 pb-0 lg:p-7.5 lg:pb-0">
          <GalleryList galleries={galleries} />
        </div>

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
      {renderContent()}
    </>
  );
};