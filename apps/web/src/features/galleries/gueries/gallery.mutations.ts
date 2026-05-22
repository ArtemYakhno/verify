import { useMutation, useQueryClient } from "@tanstack/react-query";
import { galleriesService } from "@/common/api/services/galleries.service";
import type {
  FieldsGalleryValues,
  UpdateFieldsGalleryValues,
} from "../schemas/gallery-request.schema";
import { galleryKeys } from "./gallery.keys";

export const useCreateGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FieldsGalleryValues) =>
      galleriesService.createGallery(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: galleryKeys.my() });
    },
  });
};

export const useUpdateGallery = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateFieldsGalleryValues) =>
      galleriesService.updateGallery(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: galleryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: galleryKeys.my() });
    },
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => galleriesService.softDeleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: galleryKeys.my() });
    },
  });
};
