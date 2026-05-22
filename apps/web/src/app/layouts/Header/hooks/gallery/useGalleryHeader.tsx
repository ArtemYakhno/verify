import { useParams } from "react-router-dom";
import { buildPath, RoutePath } from "@/app/routes/configs/root.config";
import type { PayloadConfig } from "../../configs/payload.config";
import { ActionBtn } from "../../components/ActionBtn";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { useRouteMatch } from "@/app/routes/hooks/useRouteMatch";

export const useGalleryHeader = (): PayloadConfig | null => {
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;


  const { isOwner, gallery } = useGalleryOwner();

  const { isGalleries, isCreateGallery, isUploadGallery, isEditGallery, isGalleryDetail } = useRouteMatch()

  if (isGalleries) return {
    title: "List of galleries",
    action: <ActionBtn to={RoutePath.GalleryCreate} label="Create a new gallery" />,
  };

  if (isCreateGallery) return {
    title: "Create a new gallery",
    action: <ActionBtn to={RoutePath.Galleries} label="Go to gallery list" />,
  };

  if (isUploadGallery) return { title: "Upload photos" };

  if (isEditGallery && numericId) return {
    title: "Edit gallery",
    action: isOwner
      ? <ActionBtn to={buildPath.galleryUpload(numericId)} label="Upload photos" />
      : undefined,
  };

  if (isGalleryDetail && numericId) return {
    title: gallery?.title ?? `Gallery: #${numericId}`,
    action: isOwner
      ? <ActionBtn to={buildPath.galleryUpload(numericId)} label="Upload photos" />
      : undefined,
  };

  return null;
};