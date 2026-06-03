import { describe, it, expect, vi, beforeEach } from "vitest";
import { imagesService } from "../images.service";
import { apiClient } from "../../apiClient";
import type { AxiosProgressEvent } from "axios";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

vi.mock("@/common/utils/erros/parse-api-response", () => ({
  parseApiResponse: vi.fn((_schema, data) => data),
}));

vi.mock("axios", () => ({
  toFormData: vi.fn((obj) => obj),
}));

const mockImage = {
  id: 1,
  path: "/path/to/image",
  galleryId: 1,
  originalFilename: "filename.jpg",
  name: "Image name",
  comment: "Image comment",
  createdAt: "2026-06-01T12:24:12.977Z",
  updatedAt: "2026-06-01T12:24:12.977Z",
};

const mockPaginatedImages = {
  data: [mockImage],
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

describe("imagesService", () => {
  describe("getImages", () => {
    it("calls GET /galleries/:galleryId/images with default pagination", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedImages });

      await imagesService.getImages(1, {});

      expect(mockGet).toHaveBeenCalledWith("/galleries/1/images", {
        params: { page: 1, perPage: 10 },
      });
    });

    it("calls GET with provided pagination params", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedImages });

      await imagesService.getImages(1, { page: 3, perPage: 20 });

      expect(mockGet).toHaveBeenCalledWith("/galleries/1/images", {
        params: { page: 3, perPage: 20 },
      });
    });

    it("returns parsed paginated images", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedImages });

      const result = await imagesService.getImages(1, {});

      expect(result).toEqual(mockPaginatedImages);
    });
  });

  describe("getMyImages", () => {
    it("calls GET /galleries/:galleryId/images/my", async () => {
      mockGet.mockResolvedValue({ data: [mockImage] });

      await imagesService.getMyImages(1);

      expect(mockGet).toHaveBeenCalledWith("/galleries/1/images/my");
    });

    it("returns parsed array of images", async () => {
      mockGet.mockResolvedValue({ data: [mockImage] });

      const result = await imagesService.getMyImages(1);

      expect(result).toEqual([mockImage]);
    });
  });

  describe("uploadImage", () => {
    const uploadBody = {
      file: new File(["content"], "photo.jpg", { type: "image/jpeg" }),
      name: "sunset",
      comment: "nice view",
    };

    it("calls POST /galleries/:galleryId/images with form data", async () => {
      mockPost.mockResolvedValue({ data: mockImage });

      await imagesService.uploadImage(1, uploadBody);

      expect(mockPost).toHaveBeenCalledWith(
        "/galleries/1/images",
        { image: uploadBody.file, name: "sunset", comment: "nice view" },
        expect.objectContaining({ onUploadProgress: expect.any(Function) }),
      );
    });

    it("returns uploaded image", async () => {
      mockPost.mockResolvedValue({ data: mockImage });

      const result = await imagesService.uploadImage(1, uploadBody);

      expect(result).toEqual(mockImage);
    });

    it("calls onProgress with correct percentage", async () => {
      mockPost.mockImplementation(async (_url, _body, config) => {
        config?.onUploadProgress?.({
          loaded: 50,
          total: 100,
        } as AxiosProgressEvent);
        return { data: mockImage };
      });
      const onProgress = vi.fn();
      await imagesService.uploadImage(1, uploadBody, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it("does not call onProgress when event.total is missing", async () => {
      mockPost.mockImplementation(async (_url, _body, config) => {
        config?.onUploadProgress?.({
          loaded: 50,
          total: undefined,
          lengthComputable: false,
          bytes: 50,
        } as AxiosProgressEvent);
        return { data: mockImage };
      });

      const onProgress = vi.fn();
      await imagesService.uploadImage(1, uploadBody, onProgress);

      expect(onProgress).not.toHaveBeenCalled();
    });
  });

  describe("updateImage", () => {
    const updateBody = { name: "Updated Name", comment: "new comment" };

    it("calls PATCH /galleries/:galleryId/images/:imageId with body", async () => {
      mockPatch.mockResolvedValue({ data: mockImage });

      await imagesService.updateImage(1, 10, updateBody);

      expect(mockPatch).toHaveBeenCalledWith(
        "/galleries/1/images/10",
        updateBody,
      );
    });

    it("returns updated image", async () => {
      mockPatch.mockResolvedValue({ data: { ...mockImage, ...updateBody } });

      const result = await imagesService.updateImage(1, 10, updateBody);

      expect(result).toEqual({ ...mockImage, ...updateBody });
    });
  });

  describe("softDeleteImage", () => {
    it("calls PATCH /galleries/:galleryId/images/:imageId/soft-delete", async () => {
      mockPatch.mockResolvedValue({});

      await imagesService.softDeleteImage(1, 10);

      expect(mockPatch).toHaveBeenCalledWith(
        "/galleries/1/images/10/soft-delete",
      );
    });

    it("returns void", async () => {
      mockPatch.mockResolvedValue({});

      const result = await imagesService.softDeleteImage(1, 10);

      expect(result).toBeUndefined();
    });
  });

  describe("moveImage", () => {
    const actionBody = { targetGalleryId: 5 };

    it("calls PATCH /galleries/:galleryId/images/:imageId/move with body", async () => {
      mockPatch.mockResolvedValue({ data: mockImage });

      await imagesService.moveImage(1, 10, actionBody);

      expect(mockPatch).toHaveBeenCalledWith(
        "/galleries/1/images/10/move",
        actionBody,
      );
    });

    it("returns moved image", async () => {
      mockPatch.mockResolvedValue({ data: mockImage });

      const result = await imagesService.moveImage(1, 10, actionBody);

      expect(result).toEqual(mockImage);
    });
  });

  describe("copyImage", () => {
    const actionBody = { targetGalleryId: 5 };

    it("calls POST /galleries/:galleryId/images/:imageId/copy with body", async () => {
      mockPost.mockResolvedValue({ data: mockImage });

      await imagesService.copyImage(1, 10, actionBody);

      expect(mockPost).toHaveBeenCalledWith(
        "/galleries/1/images/10/copy",
        actionBody,
      );
    });

    it("returns copied image", async () => {
      mockPost.mockResolvedValue({ data: mockImage });

      const result = await imagesService.copyImage(1, 10, actionBody);

      expect(result).toEqual(mockImage);
    });
  });

  describe("softDeleteAllImages", () => {
    it("calls PATCH /galleries/:galleryId/images/soft-delete-all", async () => {
      mockPatch.mockResolvedValue({});

      await imagesService.softDeleteAllImages(1);

      expect(mockPatch).toHaveBeenCalledWith(
        "/galleries/1/images/soft-delete-all",
      );
    });

    it("returns void", async () => {
      mockPatch.mockResolvedValue({});

      const result = await imagesService.softDeleteAllImages(1);

      expect(result).toBeUndefined();
    });
  });
});
