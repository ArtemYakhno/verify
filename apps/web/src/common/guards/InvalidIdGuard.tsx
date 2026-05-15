import { Navigate, Outlet, useParams } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";

export const InvalidIdGuard = () => {
  const { id } = useParams();
  const numericId = Number(id);

  if (!id || !Number.isInteger(numericId) || numericId <= 0) {
    return <Navigate to={RoutePath.NotFoundPage} replace />;
  }

  return <Outlet />;
};