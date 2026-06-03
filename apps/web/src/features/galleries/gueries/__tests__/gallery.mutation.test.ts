// apps/web/src/features/galleries/queries/galleries.mutations.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useCreateGallery,
  useUpdateGallery,
  useDeleteGallery,
} from "../gallery.mutations";
import { galleriesService } from "@/common/api/services/galleries.service";
import { galleryKeys } from "../gallery.keys";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";
import { expectInvalidated } from "@/common/utils/test-utils/expectInvalidated";

vi.mock("@/common/api/services/galleries.service", () => ({
  galleriesService: {
    createGallery: vi.fn(),
    updateGallery: vi.fn(),
    softDeleteGallery: vi.fn(),
  },
}));

const mockGalleriesService = vi.mocked(galleriesService);

const mockGallery = {
  id: 1,
  title: "My Gallery",
  description: null,
  userId: 42,
  createdAt: new Date(),
  updatedAt: new Date(),
  imagesCount: 0,
};

const GALLERY_ID = 1;

describe("gallery mutations", () => {
  let invalidateSpy: ReturnType<typeof vi.spyOn>;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { queryClient, wrapper: w } = createWrapper({ exposeClient: true });
    wrapper = w;
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  });

  // ─── useCreateGallery ──────────────────────────────────────────────────────

  describe("useCreateGallery", () => {
    it("calls galleriesService.createGallery with correct args", async () => {
      mockGalleriesService.createGallery.mockResolvedValue(mockGallery);
      const body = { title: "New Gallery", description: null };

      const { result } = renderHook(() => useCreateGallery(), { wrapper });

      await result.current.mutateAsync(body);

      expect(mockGalleriesService.createGallery).toHaveBeenCalledWith(body);
    });

    it("invalidates lists and my queries on success", async () => {
      mockGalleriesService.createGallery.mockResolvedValue(mockGallery);

      const { result } = renderHook(() => useCreateGallery(), { wrapper });

      await result.current.mutateAsync({
        title: "New Gallery",
        description: null,
      });

      await expectInvalidated(
        invalidateSpy,
        galleryKeys.lists(),
        galleryKeys.my(),
      );
    });

    it("does NOT invalidate detail query on success", async () => {
      mockGalleriesService.createGallery.mockResolvedValue(mockGallery);

      const { result } = renderHook(() => useCreateGallery(), { wrapper });

      await result.current.mutateAsync({
        title: "New Gallery",
        description: null,
      });

      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: galleryKeys.detail(expect.any(Number)),
      });
    });

    it("exposes error when service throws", async () => {
      mockGalleriesService.createGallery.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useCreateGallery(), { wrapper });

      await act(() =>
        result.current.mutate({ title: "New Gallery", description: null }),
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useUpdateGallery", () => {
    it("calls galleriesService.updateGallery with correct args", async () => {
      mockGalleriesService.updateGallery.mockResolvedValue(mockGallery);
      const body = { title: "Updated Title" };

      const { result } = renderHook(() => useUpdateGallery(GALLERY_ID), {
        wrapper,
      });

      await result.current.mutateAsync(body);

      expect(mockGalleriesService.updateGallery).toHaveBeenCalledWith(
        GALLERY_ID,
        body,
      );
    });

    it("invalidates lists, detail and my queries on success", async () => {
      mockGalleriesService.updateGallery.mockResolvedValue(mockGallery);

      const { result } = renderHook(() => useUpdateGallery(GALLERY_ID), {
        wrapper,
      });

      await result.current.mutateAsync({ title: "Updated Title" });

      await expectInvalidated(
        invalidateSpy,
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
        galleryKeys.my(),
      );
    });

    it("uses the id passed to the hook, not a hardcoded value", async () => {
      mockGalleriesService.updateGallery.mockResolvedValue(mockGallery);
      const OTHER_ID = 99;

      const { result } = renderHook(() => useUpdateGallery(OTHER_ID), {
        wrapper,
      });

      await result.current.mutateAsync({ title: "Title" });

      expect(mockGalleriesService.updateGallery).toHaveBeenCalledWith(
        OTHER_ID,
        expect.anything(),
      );

      await expectInvalidated(invalidateSpy, galleryKeys.detail(OTHER_ID));
    });

    it("exposes error when service throws", async () => {
      mockGalleriesService.updateGallery.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useUpdateGallery(GALLERY_ID), {
        wrapper,
      });

      await act(() => result.current.mutate({ title: "Updated Title" }));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useDeleteGallery", () => {
    it("calls galleriesService.softDeleteGallery with correct id", async () => {
      mockGalleriesService.softDeleteGallery.mockResolvedValue();

      const { result } = renderHook(() => useDeleteGallery(), { wrapper });

      await result.current.mutateAsync(GALLERY_ID);

      expect(mockGalleriesService.softDeleteGallery).toHaveBeenCalledWith(
        GALLERY_ID,
      );
    });

    it("invalidates lists and my queries on success", async () => {
      mockGalleriesService.softDeleteGallery.mockResolvedValue();

      const { result } = renderHook(() => useDeleteGallery(), { wrapper });

      await result.current.mutateAsync(GALLERY_ID);

      await expectInvalidated(
        invalidateSpy,
        galleryKeys.lists(),
        galleryKeys.my(),
      );
    });

    it("does NOT invalidate detail query on success", async () => {
      mockGalleriesService.softDeleteGallery.mockResolvedValue();

      const { result } = renderHook(() => useDeleteGallery(), { wrapper });

      await result.current.mutateAsync(GALLERY_ID);

      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: galleryKeys.detail(expect.any(Number)),
      });
    });

    it("exposes error when service throws", async () => {
      mockGalleriesService.softDeleteGallery.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useDeleteGallery(), { wrapper });

      await act(() => result.current.mutate(GALLERY_ID));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
