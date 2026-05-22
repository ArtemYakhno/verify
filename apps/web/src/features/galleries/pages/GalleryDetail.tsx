import { useParams } from "react-router-dom";
import { useGetGalleryById } from "../gueries/gallery.queries";
import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { MOCK_PHOTOS } from "@/common/moks/gallery-detail.mock";
import { GalleryDetailHeader } from "../blocks/GalleryDetail/GalleryDetailHeader";
import { GalleryPhotoList } from "../blocks/GalleryDetail/GalleryPhotoList";
import { GalleryDetailFooter } from "../blocks/GalleryDetail/GalleryDetailFooter";
import { GalleryDetailPlug } from "../blocks/GalleryDetail/GalleryDetailPlug";

export const GalleryDetail = () => {
  const { id } = useParams();
  const galleryId = Number(id);

  const { data: gallery, isLoading, isError, error } = useGetGalleryById(galleryId);

  const photos = MOCK_PHOTOS;

  const renderContent = () => {
    if (isLoading || !gallery) return <LoadingPlug />;
    if (isError) {
      return <GalleryDetailPlug error={error} />;
    }

    return (
      <>
        <GalleryDetailHeader
          title={gallery.title}
          description={gallery.description}
        />

        <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-7.5 pt-4 lg:pt-10">
          <GalleryPhotoList photos={photos} />
        </div>

        <GalleryDetailFooter
          count={photos.length}
          onDeleteAll={() => { }}
        />
      </>
    );
  };

  return (
    <div className="flex flex-col flex-1 bg-nature-white rounded-lg min-h-0 py-4 lg:py-7.5">
      {renderContent()}
    </div>
  );
};