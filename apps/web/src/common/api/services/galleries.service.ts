import type { InputGalleriesQuery } from "@/features/galleries/schemas/gallery-query.schema";
import { apiClient } from "../apiClient";
import {
  paginatedGalleriesSchema,
  type Gallery,
  type PaginatedGalleries,
} from "@/features/galleries/schemas/gallery-response.schema";
import type {
  FieldsGalleryValues,
  UpdateFieldsGalleryValues,
} from "@/features/galleries/schemas/gallery-request.schema";
import { gallerySchema } from "@/features/galleries/schemas/gallery-base.schema";
import { parseApiResponse } from "@/common/utils/erros/parse-api-response";
import { removeEmptyParams } from "@/common/utils/search/searchHelper";

export const galleriesService = {
  getGalleries: async (
    params: InputGalleriesQuery,
  ): Promise<PaginatedGalleries> => {
    const cleanedParams = removeEmptyParams(params);
    const { data } = await apiClient.get("/galleries", {
      params: cleanedParams,
    });
    return parseApiResponse(paginatedGalleriesSchema, data);
  },

  getGalleryById: async (id: number): Promise<Gallery> => {
    const { data } = await apiClient.get(`/galleries/${id}`);
    return parseApiResponse(gallerySchema, data);
  },

  getMyGalleries: async (): Promise<Gallery[]> => {
    const { data } = await apiClient.get(`/galleries/my`);
    return parseApiResponse(gallerySchema.array(), data);
  },

  createGallery: async (body: FieldsGalleryValues): Promise<Gallery> => {
    const { data } = await apiClient.post("/galleries", body);
    return parseApiResponse(gallerySchema, data);
  },

  updateGallery: async (
    id: number,
    body: UpdateFieldsGalleryValues,
  ): Promise<Gallery> => {
    const { data } = await apiClient.patch(`/galleries/${id}`, body);
    return parseApiResponse(gallerySchema, data);
  },

  softDeleteGallery: async (id: number): Promise<void> => {
    await apiClient.patch(`/galleries/${id}/soft-delete`);
  },
};
