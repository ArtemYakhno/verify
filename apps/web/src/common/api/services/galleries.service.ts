import type { GalleriesQuery } from "@/features/galleries/schemas/gallery-query.schema";
import { apiClient } from "../apiClient";
import { type PaginatedGalleries } from "@/features/galleries/schemas/gallery-pagination.schema";
import { type Gallery } from "@/features/galleries/schemas/gallery-base.schema";
import type {
  CreateGalleryValues,
  UpdateGalleryValues,
} from "@/features/galleries/schemas/gallery-dto.schema";

export const galleriesService = {
  getGalleries: async (
    params: GalleriesQuery = {},
  ): Promise<PaginatedGalleries> => {
    const { page = 1, perPage = 10 } = params;
    const { data } = await apiClient.get("/galleries", {
      params: { page, perPage },
    });

    return data;
    // return parseApiResponse(paginatedGalleriesSchema, data);
  },

  getGalleryById: async (id: number): Promise<Gallery> => {
    const { data } = await apiClient.get(`/galleries/${id}`);
    // return parseApiResponse(gallerySchema, data);
    return data;
  },

  createGallery: async (body: CreateGalleryValues): Promise<Gallery> => {
    const { data } = await apiClient.post("/galleries", body);
    // return parseApiResponse(gallerySchema, data);
    return data;
  },

  updateGallery: async (
    id: number,
    body: UpdateGalleryValues,
  ): Promise<Gallery> => {
    const { data } = await apiClient.patch(`/galleries/${id}`, body);
    // return parseApiResponse(gallerySchema, data);
    return data;
  },

  deleteGallery: async (id: number): Promise<void> => {
    await apiClient.delete(`/galleries/${id}`);
  },
};
