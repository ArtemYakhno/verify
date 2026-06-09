import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordForm } from "../PasswordForm";
import { useChangePassword } from "../../queries/profile.mutations";
import { openSuccessModal } from "@/common/stores/success-modal.store";

vi.mock("../../queries/profile.mutations", () => ({
  useChangePassword: vi.fn(),
}));

vi.mock("@/common/stores/success-modal.store", () => ({
  openSuccessModal: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { warning: vi.fn() },
}));

const mockMutateAsync = vi.fn();
const mockUseChangePassword = vi.mocked(useChangePassword);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseChangePassword.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useChangePassword>);
});

const fillForm = async (current: string, next: string, confirm: string) => {
  await userEvent.type(screen.getByPlaceholderText("********"), current);
  await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), next);
  await userEvent.type(screen.getByPlaceholderText("New password confirmation"), confirm);
};

describe("PasswordForm", () => {
  it("strips confirmPassword before calling changePassword", async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<PasswordForm email="john@example.com" />);

    await fillForm("OldPass1!", "NewPass1!", "NewPass1!");
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!",
      });
    });
  });

  it("opens success modal and resets form on success", async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<PasswordForm email="john@example.com" />);

    await fillForm("OldPass1!", "NewPass1!", "NewPass1!");
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(openSuccessModal).toHaveBeenCalled();
      expect(screen.getByPlaceholderText("********")).toHaveValue("");
    });
  });

  it("does not open modal when mutation throws", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Wrong password"));
    render(<PasswordForm email="john@example.com" />);

    await fillForm("OldPass1!", "NewPass1!", "NewPass1!");
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(openSuccessModal).not.toHaveBeenCalled();
    });
  });

  it("shows PasswordChecklist when newPassword is not empty", async () => {
    render(<PasswordForm email="john@example.com" />);

    expect(screen.queryByTestId("password-checklist")).not.toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "N");

    expect(screen.getByTestId("password-checklist")).toBeInTheDocument();
  });

  it("disables button while pending", () => {
    mockUseChangePassword.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useChangePassword>);

    render(<PasswordForm email="john@example.com" />);

    expect(screen.getByRole("button", { name: /change password/i })).toBeDisabled();
  });
});