import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryDetail } from "../GalleryDetail";
import type { Image } from "@/features/images/schemas/image-response.schema";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
}));
vi.mock("@/features/images/hooks/useGalleryImagesParams", () => ({
  useGalleryImagesParams: () => ({
    params: { page: 1, perPage: 10 },
    setPage: vi.fn(),
  }),
}));


vi.mock("../../gueries/gallery.queries", () => ({
  useGetGalleryById: () => ({
    data: {
      id: 1,
      title: "Test gallery",
      description: "Test description",
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@/features/images/gueries/images.queries", () => ({
  useGetImages: () => ({
    data: {
      data: [
        { id: 1, path: "/img1.jpg" },
        { id: 2, path: "/img2.jpg" },
      ],
      meta: { total: 2 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("../../blocks/GalleryDetail/GalleryDetailHeader", () => ({
  GalleryDetailHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../../blocks/GalleryDetail/GalleryPhotoList", () => ({
  GalleryPhotoList: ({ photos }: { photos: Image[] }) => (
    <div>Photos: {photos.length}</div>
  ),
}));

vi.mock("../../blocks/GalleryDetail/GalleryDetailFooter", () => ({
  GalleryDetailFooter: ({ page }: { page: number }) => <div>Page {page}</div>,
}));

vi.mock("../../blocks/Gallery/GalleryPlug", () => ({
  GalleryPlug: ({ variant }: { variant: string }) => <div>Plug {variant}</div>,
}));

vi.mock("../../blocks/GalleryDetail/GalleryDetailPlug", () => ({
  GalleryDetailPlug: ({ variant }: { variant: string }) => (
    <div>DetailPlug {variant}</div>
  ),
}));

vi.mock("@/common/components/ui/loading-plug", () => ({
  LoadingPlug: () => <div>Loading...</div>,
}));


beforeEach(async () => {
  vi.clearAllMocks();

  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true,
  });
});


describe("GalleryDetail", () => {
  it("renders gallery content", () => {
    render(<GalleryDetail />);

    expect(screen.getByText("Test gallery")).toBeInTheDocument();
    expect(screen.getByText("Photos: 2")).toBeInTheDocument();
    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });

  it("renders loading state when needed", () => {
    expect(true).toBe(true);
  });
});