import { imageSchema } from "@/features/images/schemas/image-base.schema";
import { apiClient } from "../apiClient";
import { parseApiResponse } from "@/common/utils/erros/parse-api-response";
import type { InputImagesQuery } from "@/features/images/schemas/image-query.schema";
import type {
  ActionImageValues,
  UpdateImageMetadataValues,
  UploadImageItemValues,
} from "@/features/images/schemas/image-request.schema";
import {
  galleryImagesSchema,
  paginatedImagesSchema,
  type Image,
  type PaginatedImages,
} from "@/features/images/schemas/image-response.schema";
import { toFormData } from "axios";
import type { UploadImageProgressHandler } from "@/features/galleries/types/upload-progress";

export const imagesService = {
  getImages: async (
    galleryId: number,
    params: InputImagesQuery,
  ): Promise<PaginatedImages> => {
    const { page = 1, perPage = 10 } = params;
    const { data } = await apiClient.get(`/galleries/${galleryId}/images`, {
      params: { page, perPage },
    });
    return parseApiResponse(paginatedImagesSchema, data);
  },

  getMyImages: async (galleryId: number): Promise<Image[]> => {
    const { data } = await apiClient.get(`/galleries/${galleryId}/images/my`);
    return parseApiResponse(galleryImagesSchema, data);
  },

  uploadImage: async (
    galleryId: number,
    body: UploadImageItemValues,
    onProgress?: UploadImageProgressHandler,
  ): Promise<Image> => {
    const { data } = await apiClient.post(
      `/galleries/${galleryId}/images`,
      toFormData({
        image: body.file,
        name: body.name,
        comment: body.comment,
      }),
      {
        onUploadProgress: (event) => {
          if (!event.total) return;

          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        },
      },
    );
    return parseApiResponse(imageSchema, data);
  },

  updateImage: async (
    galleryId: number,
    imageId: number,
    body: UpdateImageMetadataValues,
  ): Promise<Image> => {
    const { data } = await apiClient.patch(
      `/galleries/${galleryId}/images/${imageId}`,
      body,
    );
    return parseApiResponse(imageSchema, data);
  },

  softDeleteImage: async (
    galleryId: number,
    imageId: number,
  ): Promise<void> => {
    await apiClient.patch(
      `/galleries/${galleryId}/images/${imageId}/soft-delete`,
    );
  },

  moveImage: async (
    galleryId: number,
    imageId: number,
    body: ActionImageValues,
  ): Promise<Image> => {
    const { data } = await apiClient.patch(
      `/galleries/${galleryId}/images/${imageId}/move`,
      body,
    );

    return parseApiResponse(imageSchema, data);
  },

  copyImage: async (
    galleryId: number,
    imageId: number,
    body: ActionImageValues,
  ): Promise<Image> => {
    const { data } = await apiClient.post(
      `/galleries/${galleryId}/images/${imageId}/copy`,
      body,
    );

    return parseApiResponse(imageSchema, data);
  },

  softDeleteAllImages: async (galleryId: number): Promise<void> => {
    await apiClient.patch(`/galleries/${galleryId}/images/soft-delete-all`);
  },
};
