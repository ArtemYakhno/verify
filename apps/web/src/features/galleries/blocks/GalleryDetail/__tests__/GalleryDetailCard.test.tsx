import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GalleryPhotoCard } from "../GalleryPhotoCard";
import type { Image } from "@/features/images/schemas/image-response.schema";

const mockDelete = vi.fn();
const mockMove = vi.fn();
const mockCopy = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/features/images/gueries/images.mutations", () => ({
  useSoftDeleteImage: () => ({
    mutateAsync: mockDelete,
    isPending: false,
  }),
  useMoveImage: () => ({
    mutateAsync: mockMove,
    isPending: false,
  }),
  useCopyImage: () => ({
    mutateAsync: mockCopy,
    isPending: false,
  }),
  useUpdateImage: () => ({
    mutateAsync: mockUpdate,
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

vi.mock("@/common/utils/erros/errors", () => ({
  extractErrorMessage: vi.fn(),
}));

vi.mock("../../modals/EditImageModal", () => ({
  EditImageModal: () => <div>Edit Image Modal</div>,
}));

vi.mock(
  "@/features/galleries/blocks/Form/FormMyGalleriesSelect",
  () => ({
    FormMyGalleriesSelect: ({
      setTargetGalleryId,
    }: {
      setTargetGalleryId: (id: number) => void;
    }) => (
      <button onClick={() => setTargetGalleryId(99)}>
        Select Gallery
      </button>
    ),
  }),
);

vi.mock("../../modals/EditImageModal", () => ({
  EditImageModal: () => null,
}));

vi.mock("@/common/components/blocks/ActionsMenu", () => ({
  ActionsMenu: ({
    actions,
  }: {
    actions: Array<{
      label: string;
      onClick: () => void;
    }>;
  }) => (
    <div>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

const photo: Image = {
  id: 1,
  galleryId: 10,
  originalFilename: "test-image.jpg",
  path: "/test-image.jpg",
  name: "My Photo",
  comment: "Photo comment",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

describe("GalleryPhotoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders photo information", () => {
    render(<GalleryPhotoCard photo={photo} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/test-image.jpg",
    );

    expect(screen.getByText("My Photo")).toBeInTheDocument();

    expect(screen.getByText("Photo comment")).toBeInTheDocument();
  });

  it("renders fallback description", () => {
    render(
      <GalleryPhotoCard
        photo={{
          ...photo,
          comment: "",
        }}
      />,
    );

    expect(screen.getByText("No description yet")).toBeInTheDocument();
  });

  it("opens delete modal", async () => {
    render(<GalleryPhotoCard photo={photo} />);

    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    expect(
      screen.getByRole("heading", {
        name: /delete image/i,
      }),
    ).toBeInTheDocument();
  });

  it("deletes image", async () => {
    mockDelete.mockResolvedValue(undefined);

    render(<GalleryPhotoCard photo={photo} />);

    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    await user.click(
      screen.getByRole("button", {
        name: /^delete$/i,
      }),
    );

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({
        galleryId: 10,
        imageId: 1,
      });
    });
  });

  it("moves image", async () => {
    mockMove.mockResolvedValue(undefined);

    render(<GalleryPhotoCard photo={photo} />);

    const user = userEvent.setup();

    await user.click(screen.getByText("Move"));

    await user.click(screen.getByText("Select Gallery"));

    await user.click(
      screen.getByRole("button", {
        name: /^move$/i,
      }),
    );

    await waitFor(() => {
      expect(mockMove).toHaveBeenCalledWith({
        galleryId: 10,
        imageId: 1,
        body: {
          targetGalleryId: 99,
        },
      });
    });
  });

  it("copies image", async () => {
    mockCopy.mockResolvedValue(undefined);

    render(<GalleryPhotoCard photo={photo} />);

    const user = userEvent.setup();

    await user.click(screen.getByText("Copy"));

    await user.click(screen.getByText("Select Gallery"));

    await user.click(
      screen.getByRole("button", {
        name: /^copy$/i,
      }),
    );

    await waitFor(() => {
      expect(mockCopy).toHaveBeenCalledWith({
        galleryId: 10,
        imageId: 1,
        body: {
          targetGalleryId: 99,
        },
      });
    });
  });
});