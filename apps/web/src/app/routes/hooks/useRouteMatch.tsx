import { matchPath, useLocation, type PathMatch } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";

export const useRouteMatch = () => {
  const { pathname } = useLocation();

  const match = (path: string) => matchPath({ path, end: true }, pathname);

  const galleriesMatch = match(RoutePath.Galleries);
  const createGalleryMatch = match(RoutePath.GalleryCreate);
  const detailGalleryMatch = match(RoutePath.GalleryDetail);
  const editGalleryMatch = match(RoutePath.GalleryEdit);
  const uploadGalleryMatch = match(RoutePath.GalleryUpload);
  const profileMatch = match(RoutePath.Profile);
  const userManagementMatch = match(RoutePath.UserManagement);

  const getNumericId = (routeMatch: PathMatch<string> | null) => {
    const id = routeMatch?.params.id;
    return id && !Number.isNaN(Number(id)) ? Number(id) : undefined;
  };

  const detailGalleryId = getNumericId(detailGalleryMatch);
  const editGalleryId = getNumericId(editGalleryMatch);
  const uploadGalleryId = getNumericId(uploadGalleryMatch);

  return {
    isGalleries: !!galleriesMatch,
    isCreateGallery: !!createGalleryMatch,
    isGalleryDetail: !!detailGalleryMatch && !!detailGalleryId,
    galleryDetailId: detailGalleryId,
    isEditGallery: !!editGalleryMatch && !!editGalleryId,
    galleryEditId: editGalleryId,
    isUploadGallery: !!uploadGalleryMatch && !!uploadGalleryId,
    galleryUploadId: uploadGalleryId,
    isProfile: !!profileMatch,
    isUserManagment: !!userManagementMatch,
  };
};


