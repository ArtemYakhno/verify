import { useMutation, useQueryClient } from "@tanstack/react-query";
import { imagesService } from "@/common/api/services/images.service";
import type {
  ActionImageValues,
  UpdateImageMetadataValues,
  UploadImageItemValues,
} from "../schemas/image-request.schema";
import { imageKeys } from "./images.keys";
import { galleryKeys } from "@/features/galleries/gueries/gallery.keys";
import type { UploadImageProgressHandler } from "@/features/galleries/types/upload-progress";

interface GalleryImageBaseVars {
  galleryId: number;
  imageId: number;
}

interface UploadImageVars {
  galleryId: number;
  body: UploadImageItemValues;
  onProgress?: UploadImageProgressHandler;
}

interface UpdateImageVars extends GalleryImageBaseVars {
  body: UpdateImageMetadataValues;
}

interface ActionImageVars extends GalleryImageBaseVars {
  body: ActionImageValues;
}

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, body, onProgress }: UploadImageVars) =>
      imagesService.uploadImage(galleryId, body, onProgress),
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, imageId, body }: UpdateImageVars) =>
      imagesService.updateImage(galleryId, imageId, body),
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};

export const useSoftDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, imageId }: GalleryImageBaseVars) =>
      imagesService.softDeleteImage(galleryId, imageId),
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};

export const useSoftDeleteAllImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId }: { galleryId: number }) =>
      imagesService.softDeleteAllImages(galleryId),
    onSuccess: (_, { galleryId }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};

export const useMoveImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, imageId, body }: ActionImageVars) =>
      imagesService.moveImage(galleryId, imageId, body),
    onSuccess: (_, { galleryId, body }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(body.targetGalleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};

export const useCopyImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, imageId, body }: ActionImageVars) =>
      imagesService.copyImage(galleryId, imageId, body),
    onSuccess: (_, { galleryId, body }) => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(galleryId),
      });
      queryClient.invalidateQueries({
        queryKey: imageKeys.byGallery(body.targetGalleryId),
      });
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: galleryKeys.detail(galleryId),
      });
    },
  });
};
