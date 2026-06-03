import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetImages, useGetMyImages } from "../images.queries";
import { imagesService } from "@/common/api/services/images.service";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";

vi.mock("@/common/api/services/images.service", () => ({
  imagesService: {
    getImages: vi.fn(),
    getMyImages: vi.fn(),
  },
}));

const mockGetImages = vi.mocked(imagesService.getImages);
const mockGetMyImages = vi.mocked(imagesService.getMyImages);

const mockPaginatedImages = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    perPage: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGetImages", () => {
  it("fetches images when galleryId is valid", async () => {
    mockGetImages.mockResolvedValue(mockPaginatedImages);

    const { result } = renderHook(
      () => useGetImages(1, { page: 1, perPage: 12 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetImages).toHaveBeenCalledWith(1, { page: 1, perPage: 12 });
    expect(result.current.data).toEqual(mockPaginatedImages);
  });

  it("does not fetch when galleryId is 0", () => {
    const { result } = renderHook(() => useGetImages(0, {}), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetImages).not.toHaveBeenCalled();
  });

  it("keeps previous data while fetching new page (placeholderData)", async () => {
    mockGetImages.mockResolvedValue(mockPaginatedImages);

    const { result, rerender } = renderHook(
      ({ params }) => useGetImages(1, params),
      {
        wrapper: createWrapper(),
        initialProps: { params: { page: 1 } },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockGetImages.mockResolvedValue({ ...mockPaginatedImages, data: [] });
    rerender({ params: { page: 2 } });

    expect(result.current.data).toBeDefined();
    expect(result.current.isPlaceholderData).toBe(true);
  });
});

describe("useGetMyImages", () => {
  it("fetches my images when galleryId is valid", async () => {
    mockGetMyImages.mockResolvedValue([]);

    const { result } = renderHook(() => useGetMyImages(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetMyImages).toHaveBeenCalledWith(1);
  });

  it("does not fetch when galleryId is 0", () => {
    const { result } = renderHook(() => useGetMyImages(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetMyImages).not.toHaveBeenCalled();
  });
});
