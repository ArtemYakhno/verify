import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountForm } from "../AccountForm";
import { useUpdateProfile } from "../../queries/profile.mutations";
import { openSuccessModal } from "@/common/stores/success-modal.store";
import { toast } from "sonner";

const mockMutateAsync = vi.fn();

const mockUseUpdateProfile = vi.mocked(useUpdateProfile);

vi.mock("../../queries/profile.mutations", () => ({
  useUpdateProfile: vi.fn(),
}));

vi.mock("@/common/stores/success-modal.store", () => ({
  openSuccessModal: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { warning: vi.fn() },
}));



beforeEach(() => {
  vi.clearAllMocks();
  mockUseUpdateProfile.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>);
});

const defaultProps = { firstname: "John", lastname: "Doe" };

describe("AccountForm", () => {
  it("populates fields with initial props", () => {
    render(<AccountForm {...defaultProps} />);

    expect(screen.getByPlaceholderText("Enter first name")).toHaveValue("John");
    expect(screen.getByPlaceholderText("Enter last name")).toHaveValue("Doe");
  });

  it("resets form when props change", () => {
    const { rerender } = render(<AccountForm {...defaultProps} />);

    rerender(<AccountForm firstname="Jane" lastname="Smith" />);

    expect(screen.getByPlaceholderText("Enter first name")).toHaveValue("Jane");
    expect(screen.getByPlaceholderText("Enter last name")).toHaveValue("Smith");
  });

  it("shows toast warning if form is not dirty", async () => {
    render(<AccountForm {...defaultProps} />);

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(toast.warning).toHaveBeenCalledWith("There are no changes");
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls updateProfile and opens modal on success", async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<AccountForm {...defaultProps} />);

    await userEvent.clear(screen.getByPlaceholderText("Enter first name"));
    await userEvent.type(screen.getByPlaceholderText("Enter first name"), "Jane");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ firstname: "Jane", lastname: "Doe" });
      expect(openSuccessModal).toHaveBeenCalled();
    });
  });

  it("does not open modal when mutation throws", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Server error"));
    render(<AccountForm {...defaultProps} />);

    await userEvent.clear(screen.getByPlaceholderText("Enter first name"));
    await userEvent.type(screen.getByPlaceholderText("Enter first name"), "Jane");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(openSuccessModal).not.toHaveBeenCalled();
    });
  });

  it("disables button while pending", () => {
    mockUseUpdateProfile.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateProfile>);

    render(<AccountForm {...defaultProps} />);

    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });
});