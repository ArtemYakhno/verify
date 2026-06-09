import type { PayloadConfig } from "../configs/payload.config";
import { useGalleryHeader } from "./useGalleryHeader";
import { useStaticHeaderConfig } from "./useStaticHeader";



export const useHeaderConfigs = (): PayloadConfig => {
  const staticConfig = useStaticHeaderConfig();
  const galleryConfig = useGalleryHeader();

  return staticConfig ?? galleryConfig ?? { title: "Verify" };
};