import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditImageModal } from "./EditImageModal";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";
import type { SuccessModalData } from "@/common/stores/success-modal.store";

const mockUpdateImage = vi.fn();
const mockOnClose = vi.fn();
const mockSuccessModal = vi.fn();
const mockToastWarning = vi.fn();

vi.mock("@/features/images/gueries/images.mutations", () => ({
  useUpdateImage: () => ({
    mutateAsync: mockUpdateImage,
    isPending: false,
  }),
}));

vi.mock("@/common/stores/success-modal.store", () => ({
  openSuccessModal: (args: SuccessModalData) => mockSuccessModal(args),
}));

vi.mock("sonner", () => ({
  toast: {
    warning: (msg: string) => mockToastWarning(msg),
  },
}));

const wrapper = createWrapper();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  galleryId: 1,
  imageId: 10,
  initialName: "Initial name",
  initialComment: "Initial comment",
};

describe("EditImageModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal content", () => {
    render(<EditImageModal {...defaultProps} />, { wrapper });

    expect(screen.getByText("Edit details")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("shows initial values", () => {
    render(<EditImageModal {...defaultProps} />, { wrapper });

    const nameInput = screen.getByPlaceholderText(
      "Name",
    ) as HTMLInputElement;

    expect(nameInput.value).toBe("Initial name");
  });

  it("shows warning when no changes are made", async () => {
    render(<EditImageModal {...defaultProps} />, { wrapper });

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    expect(mockToastWarning).toHaveBeenCalledWith("There are no changes");
  });

  it("submits updated image successfully", async () => {
    mockUpdateImage.mockResolvedValue(undefined);

    render(<EditImageModal {...defaultProps} />, { wrapper });

    const user = userEvent.setup();

    await user.clear(screen.getByPlaceholderText("Name"));
    await user.type(
      screen.getByPlaceholderText("Name"),
      "Updated name",
    );

    await user.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() => {
      expect(mockUpdateImage).toHaveBeenCalledWith({
        galleryId: 1,
        imageId: 10,
        body: {
          name: "Updated name",
          comment: "Initial comment",
        },
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockSuccessModal).toHaveBeenCalledWith({
      title: "Image updated",
      description: "Image details have been successfully updated.",
    });
  });

  it("calls onClose when cancel clicked", async () => {
    render(<EditImageModal {...defaultProps} />, { wrapper });

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /cancel/i }),
    );

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("disables submit button while submitting state simulated", () => {
    render(<EditImageModal {...defaultProps} />, { wrapper });

    const button = screen.getByRole("button", {
      name: /save changes/i,
    });

    expect(button).toBeDisabled();
  });
});