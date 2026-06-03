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
    const numeric = Number(id);
    return id && !Number.isNaN(numeric) && numeric > 0 ? numeric : undefined;
  };

  const detailGalleryId = getNumericId(detailGalleryMatch);
  const editGalleryId = getNumericId(editGalleryMatch);
  const uploadGalleryId = getNumericId(uploadGalleryMatch);

  return {
    isGalleries: !!galleriesMatch,
    isCreateGallery: !!createGalleryMatch,
    galleryDetailId: detailGalleryId,
    isGalleryDetail: !!detailGalleryMatch && !!detailGalleryId,
    isEditGallery: !!editGalleryMatch && !!editGalleryId,
    isUploadGallery: !!uploadGalleryMatch && !!uploadGalleryId,
    galleryEditId: editGalleryId,
    galleryUploadId: uploadGalleryId,
    isProfile: !!profileMatch,
    isUserManagment: !!userManagementMatch,
  };
};


