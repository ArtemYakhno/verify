import { useParams } from "react-router-dom";
import { LoadingPlug } from "@/common/components/ui/loading-plug";

import { useGetGalleryById } from "../gueries/gallery.queries";
import { GalleryDetailHeader } from "../blocks/GalleryDetail/GalleryDetailHeader";
import { GalleryPhotoList } from "../blocks/GalleryDetail/GalleryPhotoList";
import { GalleryDetailPlug } from "../blocks/GalleryDetail/GalleryDetailPlug";
import { useGalleryImagesParams } from "@/features/images/hooks/useGalleryImagesParams";
import { useGetImages } from "@/features/images/gueries/images.queries";
import { useRef } from "react";
import { GalleryPlug } from "../blocks/Gallery/GalleryPlug";
import { GalleryDetailFooter } from "../blocks/GalleryDetail/GalleryDetailFooter";

export const GalleryDetail = () => {
  const { id } = useParams();
  const galleryId = Number(id);


  const { page, perPage, setPage } = useGalleryImagesParams();
  const scrollRef = useRef<HTMLDivElement | null>(null);


  const handlePageChange = (newPage: number) => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    setPage(newPage);
  };

  const {
    data: gallery,
    isLoading: isGalleryLoading,
    isError: isGalleryError,
    error: galleryError,
  } = useGetGalleryById(galleryId);

  const {
    data: images,
    isLoading: areImagesLoading,
    isError: areImagesError,
    error: imagesError,
  } = useGetImages(galleryId, { page, perPage });

  const renderContent = () => {
    const photos = images?.data ?? [];
    const meta = images?.meta;
    const isGalleryEmpty = !isGalleryLoading && gallery && !gallery.title;
    const isImagesEmpty = !areImagesLoading && photos.length === 0;


    if (isGalleryLoading || areImagesLoading) {
      return <LoadingPlug />;
    }

    if (isGalleryEmpty || isGalleryError || !gallery) {
      return <GalleryPlug variant={isGalleryError ? "error" : "empty"} error={galleryError} />
    }

    if (isImagesEmpty || areImagesError || !images) {
      return <GalleryDetailPlug variant={areImagesError ? "error" : "empty"} error={imagesError} />;
    }

    return (
      <>
        <GalleryDetailHeader
          title={gallery.title}
          description={gallery.description}
        />

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-7.5 pt-4 lg:pt-10">
          <GalleryPhotoList photos={photos} />
        </div>
        {meta && (
          <GalleryDetailFooter
            page={page}
            perPage={perPage}
            meta={meta}
            onPageChange={handlePageChange}
            gallery={gallery}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-4 lg:pt-7.5">
      {renderContent()}
    </div>
  );
};