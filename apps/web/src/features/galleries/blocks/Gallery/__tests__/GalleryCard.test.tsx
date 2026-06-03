import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GalleryCard } from "../GalleryCard";

const mockDeleteGallery = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../gueries/gallery.mutations", () => ({
  useDeleteGallery: () => ({
    mutateAsync: mockDeleteGallery,
    isPending: false,
  }),
}));

vi.mock("@/common/hooks/useGalleryOwner", () => ({
  useGalleryOwner: () => ({
    isOwner: true,
  }),
}));

vi.mock("@/common/stores/success-modal.store", () => ({
  openSuccessModal: vi.fn(),
}));

vi.mock("../../helpers/getGalleryPreview", () => ({
  getGalleryPreview: (photos: unknown[]) => ({
    items: photos,
  }),
}));

const gallery  = {
  id: 1,
  title: "My gallery",
  description: "Gallery description",
  userId: 1,
  imagesCount: 2,
  images: [
    {
      id: 1,
      path: "/image-1.jpg",
    },
    {
      id: 2,
      path: "/image-2.jpg",
    },
  ],
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <GalleryCard gallery={gallery} />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GalleryCard", () => {
  it("renders gallery title and description", () => {
    renderComponent();

    expect(screen.getByText("My gallery")).toBeInTheDocument();
    expect(screen.getByText("Gallery description")).toBeInTheDocument();
  });

  it("renders gallery images", () => {
    renderComponent();

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(2);
  });

  it("renders fallback text when description is empty", () => {
    render(
      <MemoryRouter>
        <GalleryCard
          gallery={{
            ...gallery,
            description: "",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("No description yet")).toBeInTheDocument();
  });

  it("renders placeholder when gallery has no images", () => {
    render(
      <MemoryRouter>
        <GalleryCard
          gallery={{
            ...gallery,
            images: [],
            imagesCount: 0,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("no images")).toBeInTheDocument();
  });
});