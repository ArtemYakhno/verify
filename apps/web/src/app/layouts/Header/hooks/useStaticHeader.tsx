import { useLocation } from "react-router-dom";
import type { PayloadConfig } from "../configs/payload.config";
import { STATIC_TITLES } from "../configs/static.config";

export const useStaticHeaderConfig = (): PayloadConfig | null => {
  const { pathname } = useLocation();
  const title = STATIC_TITLES[pathname];
  return title ? { title } : null;
};