import { useQuery } from "@tanstack/react-query";
import { imageKeys } from "./images.keys";
import type { ImagesQuery } from "../schemas/image-query.schema";
import { imagesService } from "@/common/api/services/images.service";

export const useGetImages = (galleryId: number, params: ImagesQuery) => {
  return useQuery({
    queryKey: imageKeys.list(galleryId, params),
    queryFn: () => imagesService.getImages(galleryId, params),
    placeholderData: (previousData) => previousData,

    enabled: !!galleryId,
  });
};

export const useGetImagesAll = (galleryId: number) => {
  return useQuery({
    queryKey: imageKeys.all(galleryId),
    queryFn: () => imagesService.getAllImages(galleryId),
    enabled: !!galleryId,
  });
};
