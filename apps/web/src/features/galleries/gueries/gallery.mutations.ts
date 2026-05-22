import { useMutation, useQueryClient } from "@tanstack/react-query";
import { galleriesService } from "@/common/api/services/galleries.service";

import type { UseFormSetError } from "react-hook-form";
import { handleMutationError } from "@/common/utils/handleMutationError";
import { galleryKeys } from "./gallery.keys";
import type {
  CreateGalleryValues,
  UpdateGalleryValues,
} from "../schemas/gallery-dto.schema";

export const useCreateGallery = (
  setError?: UseFormSetError<CreateGalleryValues>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGalleryValues) =>
      galleriesService.createGallery(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.list() });
    },
    onError: (error) => handleMutationError(error, setError),
  });
};

export const useUpdateGallery = (
  id: number,
  setError?: UseFormSetError<UpdateGalleryValues>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateGalleryValues) =>
      galleriesService.updateGallery(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.list() });
      queryClient.invalidateQueries({ queryKey: galleryKeys.detail(id) });
    },
    onError: (error) => handleMutationError(error, setError),
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => galleriesService.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.list() });
    },
    onError: (error) => handleMutationError(error),
  });
};
