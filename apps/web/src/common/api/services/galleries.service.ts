import type { GalleriesQuery } from "@/features/galleries/schemas/gallery-query.schema";
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
import { parseApiResponse } from "@/common/utils/parse-api-response";
import { gallerySchema } from "@/features/galleries/schemas/gallery-base.schema";

export const galleriesService = {
  getGalleries: async (params: GalleriesQuery): Promise<PaginatedGalleries> => {
    const { page = 1, perPage = 10 } = params;
    const { data } = await apiClient.get("/galleries", {
      params: { page, perPage },
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
