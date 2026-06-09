import { describe, it, expect, vi, beforeEach } from "vitest";
import { galleriesService } from "../galleries.service";
import { apiClient } from "../../apiClient";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@/common/utils/erros/parse-api-response", () => ({
  parseApiResponse: vi.fn((_schema, data) => data),
}));

vi.mock("@/common/utils/search/searchHelper", () => ({
  removeEmptyParams: vi.fn((params) => params),
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

const mockGallery = {
  id: 1,
  title: "Test Gallery",
  description: "desc",
  userId: 42,
  images: [
    {
      id: 1,
      path: "/path/to/image",
    },
  ],
};

const mockPaginatedGalleries = {
  data: [mockGallery],
  meta: {
    total: 1,
    page: 1,
    perPage: 12,
    totalPages: 1,
    hasNextPage: true,
    hasPreviousPage: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("galleriesService", () => {
  describe("getGalleries", () => {
    it("calls GET /galleries with cleaned params", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedGalleries });

      await galleriesService.getGalleries({ page: 1, perPage: 12, search: "" });

      expect(mockGet).toHaveBeenCalledWith("/galleries", {
        params: { page: 1, perPage: 12, search: "" },
      });
    });

    it("returns parsed paginated response", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedGalleries });

      const result = await galleriesService.getGalleries({
        page: 1,
        perPage: 10,
      });

      expect(result).toEqual(mockPaginatedGalleries);
    });
  });

  describe("getGalleryById", () => {
    it("calls GET /galleries/:id with correct id", async () => {
      mockGet.mockResolvedValue({ data: mockGallery });

      await galleriesService.getGalleryById(1);

      expect(mockGet).toHaveBeenCalledWith("/galleries/1");
    });

    it("returns parsed gallery", async () => {
      mockGet.mockResolvedValue({ data: mockGallery });

      const result = await galleriesService.getGalleryById(1);

      expect(result).toEqual(mockGallery);
    });
  });

  describe("getMyGalleries", () => {
    it("calls GET /galleries/my", async () => {
      mockGet.mockResolvedValue({ data: [mockGallery] });

      await galleriesService.getMyGalleries();

      expect(mockGet).toHaveBeenCalledWith("/galleries/my");
    });

    it("returns parsed array of galleries", async () => {
      mockGet.mockResolvedValue({ data: [mockGallery] });

      const result = await galleriesService.getMyGalleries();

      expect(result).toEqual([mockGallery]);
    });
  });

  describe("createGallery", () => {
    const createBody = { title: "New Gallery", description: "desc" };

    it("calls POST /galleries with correct body", async () => {
      mockPost.mockResolvedValue({ data: mockGallery });

      await galleriesService.createGallery(createBody);

      expect(mockPost).toHaveBeenCalledWith("/galleries", createBody);
    });

    it("returns created gallery", async () => {
      mockPost.mockResolvedValue({ data: mockGallery });

      const result = await galleriesService.createGallery(createBody);

      expect(result).toEqual(mockGallery);
    });
  });

  describe("updateGallery", () => {
    const updateBody = { title: "Updated Title" };

    it("calls PATCH /galleries/:id with correct body", async () => {
      mockPatch.mockResolvedValue({ data: mockGallery });

      await galleriesService.updateGallery(1, updateBody);

      expect(mockPatch).toHaveBeenCalledWith("/galleries/1", updateBody);
    });

    it("returns updated gallery", async () => {
      mockPatch.mockResolvedValue({ data: { ...mockGallery, ...updateBody } });

      const result = await galleriesService.updateGallery(1, updateBody);

      expect(result).toEqual({ ...mockGallery, ...updateBody });
    });
  });

  describe("softDeleteGallery", () => {
    it("calls PATCH /galleries/:id/soft-delete", async () => {
      mockPatch.mockResolvedValue({});

      await galleriesService.softDeleteGallery(1);

      expect(mockPatch).toHaveBeenCalledWith("/galleries/1/soft-delete");
    });

    it("returns void — does not return data", async () => {
      mockPatch.mockResolvedValue({});

      const result = await galleriesService.softDeleteGallery(1);

      expect(result).toBeUndefined();
    });
  });
});
