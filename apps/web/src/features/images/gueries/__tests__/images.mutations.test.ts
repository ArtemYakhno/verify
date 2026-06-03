import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useUploadImage,
  useUpdateImage,
  useSoftDeleteImage,
  useSoftDeleteAllImages,
  useMoveImage,
  useCopyImage,
} from "../images.mutations";
import { imagesService } from "@/common/api/services/images.service";
import { imageKeys } from "../images.keys";
import { galleryKeys } from "@/features/galleries/gueries/gallery.keys";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";
import { expectInvalidated } from "@/common/utils/test-utils/expectInvalidated";

vi.mock("@/common/api/services/images.service", () => ({
  imagesService: {
    uploadImage: vi.fn(),
    updateImage: vi.fn(),
    softDeleteImage: vi.fn(),
    softDeleteAllImages: vi.fn(),
    moveImage: vi.fn(),
    copyImage: vi.fn(),
  },
}));

const mockImagesService = vi.mocked(imagesService);

const GALLERY_ID = 1;
const IMAGE_ID = 10;
const TARGET_GALLERY_ID = 2;

describe("image mutations", () => {
  let invalidateSpy: ReturnType<typeof vi.spyOn>;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    const { queryClient, wrapper: w } = createWrapper({ exposeClient: true });
    wrapper = w;
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  });

  describe("useUploadImage", () => {
    it("calls imagesService.uploadImage with correct args", async () => {
      mockImagesService.uploadImage.mockResolvedValue({} as never);
      const body = {
        file: new File([], "photo.jpg"),
        name: null,
        comment: null,
      };

      const { result } = renderHook(() => useUploadImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({ galleryId: GALLERY_ID, body }),
      );

      expect(mockImagesService.uploadImage).toHaveBeenCalledWith(
        GALLERY_ID,
        body,
        undefined,
      );
    });

    it("invalidates correct queries on success", async () => {
      mockImagesService.uploadImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useUploadImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          body: { file: new File([], "photo.jpg"), name: null, comment: null },
        }),
      );

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });

  describe("useUpdateImage", () => {
    it("calls imagesService.updateImage with correct args", async () => {
      mockImagesService.updateImage.mockResolvedValue({} as never);
      const body = { name: "New Name" };

      const { result } = renderHook(() => useUpdateImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body,
        }),
      );

      expect(mockImagesService.updateImage).toHaveBeenCalledWith(
        GALLERY_ID,
        IMAGE_ID,
        body,
      );
    });

    it("invalidates correct queries on success", async () => {
      mockImagesService.updateImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useUpdateImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body: {},
        }),
      );

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });

  describe("useSoftDeleteImage", () => {
    it("calls imagesService.softDeleteImage with correct args", async () => {
      mockImagesService.softDeleteImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useSoftDeleteImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
        }),
      );

      expect(mockImagesService.softDeleteImage).toHaveBeenCalledWith(
        GALLERY_ID,
        IMAGE_ID,
      );
    });

    it("invalidates correct queries on success", async () => {
      mockImagesService.softDeleteImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useSoftDeleteImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
        }),
      );

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });

  describe("useSoftDeleteAllImages", () => {
    it("calls imagesService.softDeleteAllImages with correct args", async () => {
      mockImagesService.softDeleteAllImages.mockResolvedValue({} as never);

      const { result } = renderHook(() => useSoftDeleteAllImages(), {
        wrapper,
      });

      await act(() => result.current.mutateAsync({ galleryId: GALLERY_ID }));

      expect(mockImagesService.softDeleteAllImages).toHaveBeenCalledWith(
        GALLERY_ID,
      );
    });

    it("invalidates correct queries on success", async () => {
      mockImagesService.softDeleteAllImages.mockResolvedValue({} as never);

      const { result } = renderHook(() => useSoftDeleteAllImages(), {
        wrapper,
      });

      await act(() => result.current.mutateAsync({ galleryId: GALLERY_ID }));

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });

  describe("useMoveImage", () => {
    it("calls imagesService.moveImage with correct args", async () => {
      mockImagesService.moveImage.mockResolvedValue({} as never);
      const body = { targetGalleryId: TARGET_GALLERY_ID };

      const { result } = renderHook(() => useMoveImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body,
        }),
      );

      expect(mockImagesService.moveImage).toHaveBeenCalledWith(
        GALLERY_ID,
        IMAGE_ID,
        body,
      );
    });

    it("invalidates both source and target gallery queries on success", async () => {
      mockImagesService.moveImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useMoveImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body: { targetGalleryId: TARGET_GALLERY_ID },
        }),
      );

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        imageKeys.byGallery(TARGET_GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });

  describe("useCopyImage", () => {
    it("calls imagesService.copyImage with correct args", async () => {
      mockImagesService.copyImage.mockResolvedValue({} as never);
      const body = { targetGalleryId: TARGET_GALLERY_ID };

      const { result } = renderHook(() => useCopyImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body,
        }),
      );

      expect(mockImagesService.copyImage).toHaveBeenCalledWith(
        GALLERY_ID,
        IMAGE_ID,
        body,
      );
    });

    it("invalidates both source and target gallery queries on success", async () => {
      mockImagesService.copyImage.mockResolvedValue({} as never);

      const { result } = renderHook(() => useCopyImage(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          galleryId: GALLERY_ID,
          imageId: IMAGE_ID,
          body: { targetGalleryId: TARGET_GALLERY_ID },
        }),
      );

      await expectInvalidated(
        invalidateSpy,
        imageKeys.byGallery(GALLERY_ID),
        imageKeys.byGallery(TARGET_GALLERY_ID),
        galleryKeys.lists(),
        galleryKeys.detail(GALLERY_ID),
      );
    });
  });
});
