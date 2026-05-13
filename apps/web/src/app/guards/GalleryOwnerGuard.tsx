import { Navigate, Outlet } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";
import { toast } from "sonner";
import { useEffect } from "react";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { extractErrorMessage } from "@/common/utils/errors";


export const GalleryOwnerGuard = () => {
  const { isLoaded, isOwner, isError, error } = useGalleryOwner();

  const shouldRedirect = isError || (isLoaded && !isOwner);

  useEffect(() => {
    if (!shouldRedirect) return;

    const message = isError
      ? extractErrorMessage(error)
      : "You don't have access to this page";

    toast.error(message);
  }, [shouldRedirect, isError, error]);

  if (shouldRedirect) {
    return <Navigate to={RoutePath.Galleries} replace />;
  }

  return <Outlet />;
};