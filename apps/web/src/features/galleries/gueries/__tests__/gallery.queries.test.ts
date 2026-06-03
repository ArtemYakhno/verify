import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useGetGalleries,
  useGetGalleryById,
  useGetMyGalleries,
} from "../gallery.queries";
import { galleriesService } from "@/common/api/services/galleries.service";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";

vi.mock("@/common/api/services/galleries.service", () => ({
  galleriesService: {
    getGalleries: vi.fn(),
    getGalleryById: vi.fn(),
    getMyGalleries: vi.fn(),
  },
}));

const mockGetGalleries = vi.mocked(galleriesService.getGalleries);
const mockGetGalleryById = vi.mocked(galleriesService.getGalleryById);
const mockGetMyGalleries = vi.mocked(galleriesService.getMyGalleries);

const mockMeta = {
  total: 1,
  page: 1,
  perPage: 12,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockGalleryListItem = {
  id: 1,
  title: "My Gallery",
  description: null,
  userId: 42,
  imagesCount: 1,
  images: [{ id: 1, path: "https://example.com/image.jpg" }],
};

const mockPaginatedGalleries = {
  data: [mockGalleryListItem],
  meta: mockMeta,
};

const mockGallery = {
  id: 1,
  title: "My Gallery",
  description: null,
  userId: 42,
  createdAt: new Date(),
  updatedAt: new Date(),
  imagesCount: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGetGalleries", () => {
  it("fetches galleries with given params", async () => {
    mockGetGalleries.mockResolvedValue(mockPaginatedGalleries);

    const { result } = renderHook(
      () => useGetGalleries({ page: 1, perPage: 12 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetGalleries).toHaveBeenCalledWith({ page: 1, perPage: 12 });
    expect(result.current.data).toEqual(mockPaginatedGalleries);
  });

  it("returns gallery list items with images array", async () => {
    mockGetGalleries.mockResolvedValue(mockPaginatedGalleries);

    const { result } = renderHook(() => useGetGalleries({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data[0].images).toEqual([
      { id: 1, path: "https://example.com/image.jpg" },
    ]);
  });

  it("keeps previous data while fetching new page (placeholderData)", async () => {
    mockGetGalleries.mockResolvedValue(mockPaginatedGalleries);

    const { result, rerender } = renderHook(
      ({ params }) => useGetGalleries(params),
      {
        wrapper: createWrapper(),
        initialProps: { params: { page: 1 } },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockGetGalleries.mockResolvedValue({
      data: [],
      meta: { ...mockMeta, page: 2, total: 0, totalPages: 0 },
    });
    rerender({ params: { page: 2 } });

    expect(result.current.data).toBeDefined();
    expect(result.current.isPlaceholderData).toBe(true);
  });
});

describe("useGetGalleryById", () => {
  it("fetches gallery when id is valid", async () => {
    mockGetGalleryById.mockResolvedValue(mockGallery);

    const { result } = renderHook(() => useGetGalleryById(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetGalleryById).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(mockGallery);
  });

  it("does not fetch when id is 0", () => {
    const { result } = renderHook(() => useGetGalleryById(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetGalleryById).not.toHaveBeenCalled();
  });

  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useGetGalleryById(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetGalleryById).not.toHaveBeenCalled();
  });
});

describe("useGetMyGalleries", () => {
  it("fetches my galleries", async () => {
    mockGetMyGalleries.mockResolvedValue([mockGallery]);

    const { result } = renderHook(() => useGetMyGalleries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetMyGalleries).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([mockGallery]);
  });
});
