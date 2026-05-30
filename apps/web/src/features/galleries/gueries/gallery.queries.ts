import { useQuery } from "@tanstack/react-query";
import { galleriesService } from "@/common/api/services/galleries.service";
import { galleryKeys } from "./gallery.keys";
import type { InputGalleriesQuery } from "../schemas/gallery-query.schema";

export const useGetGalleries = (params: InputGalleriesQuery) => {
  return useQuery({
    queryKey: galleryKeys.list(params),
    queryFn: () => galleriesService.getGalleries(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetGalleryById = (id: number | undefined) => {
  return useQuery({
    queryKey: galleryKeys.detail(id!),
    queryFn: () => galleriesService.getGalleryById(id!),
    enabled: !!id,
  });
};

export const useGetMyGalleries = () => {
  return useQuery({
    queryKey: galleryKeys.my(),
    queryFn: () => galleriesService.getMyGalleries(),
  });
};
