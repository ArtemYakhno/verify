import { useQuery } from "@tanstack/react-query";
import { imageKeys } from "./images.keys";
import type { InputImagesQuery } from "../schemas/image-query.schema";
import { imagesService } from "@/common/api/services/images.service";

export const useGetImages = (galleryId: number, params: InputImagesQuery) => {
  return useQuery({
    queryKey: imageKeys.list(galleryId, params),
    queryFn: () => imagesService.getImages(galleryId, params),
    placeholderData: (previousData) => previousData,

    enabled: !!galleryId,
  });
};

export const useGetMyImages = (galleryId: number) => {
  return useQuery({
    queryKey: imageKeys.my(galleryId),
    queryFn: () => imagesService.getMyImages(galleryId),
    enabled: !!galleryId,
  });
};
