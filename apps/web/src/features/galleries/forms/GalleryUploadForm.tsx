
import { useParams } from "react-router-dom";
import { useGetGalleryById } from "../gueries/gallery.queries";
import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { GalleryFormHeader } from "../blocks/forms/GalleryFormHeader";
import { GalleryUploader } from "../blocks/forms/GalleryUploader";
import { GalleryPhotoPlug } from "../blocks/forms/GalleryPhotoPlug";

import { GalleryFormContainer } from "../layouts/GalleryFormContainer";

export const GalleryUploadForm = () => {
  const { id } = useParams();
  const galleryId = Number(id);

  const {
    data: gallery,
    isLoading,
  } = useGetGalleryById(galleryId);


  if (isLoading || !gallery) {
    return <LoadingPlug />;
  }

  return (
    <>
      <GalleryFormHeader
        title="Edit And Upload Photos"
        description="You can edit and upload new photos."
      />

      <GalleryFormContainer
        sidebar={<GalleryUploader />}
        content={<GalleryPhotoPlug />}
      />
    </>
  );
};