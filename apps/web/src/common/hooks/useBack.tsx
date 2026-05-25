import { useCallback } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { buildPath, RoutePath } from "@/app/routes/configs/root.config";

type BackState = {
  backTo?: string;
};

type BackRule = {
  path: string;
  resolve: (params: Record<string, string>) => string;
};

const BACK_RULES: BackRule[] = [
  {
    path: RoutePath.GalleryUpload,
    resolve: ({ id }) => buildPath.galleryEdit(Number(id)),
  },
  {
    path: RoutePath.GalleryEdit,
    resolve: () => RoutePath.Galleries,
  },
  {
    path: RoutePath.GalleryDetail,
    resolve: () => RoutePath.Galleries,
  },
];

const resolveBackByPath = (pathname: string): string | null => {
  for (const rule of BACK_RULES) {
    const match = matchPath({ path: rule.path, end: true }, pathname);

    if (match) {
      return rule.resolve(match.params as Record<string, string>);
    }
  }

  return null;
};

export const useBack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const state = location.state as BackState | null;
    if (state?.backTo) {
      navigate(state.backTo);
      return;
    }

    const fallbackPath = resolveBackByPath(location.pathname);

    if (fallbackPath) {
      navigate(fallbackPath);
      return;
    }
    console.log('default')

    const canGoBack = window.history.length > 1;

    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(RoutePath.Default, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);
};