import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { SignUpForm } from "../SignUpForm";
import { useRegister } from "../../queries/auth.mutations";

const mockMutate = vi.fn();

const mockUseRegister = vi.mocked(useRegister);

vi.mock("../../queries/auth.mutations", () => ({
  useRegister: vi.fn(),
}));

const renderForm = () =>
  render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();

  mockUseRegister.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useRegister>);
});

describe("SignUpForm", () => {
  it("renders heading and all fields", () => {
    renderForm();

    expect(
      screen.getByRole("heading", {
        name: /sign up/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/min\. 8 characters/i),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/confirm your password/i),
    ).toBeInTheDocument();
  });

  it("renders Continue button", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: /continue/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email/i),
      ).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email", async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "not-an-email",
    );

    await userEvent.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email/i),
      ).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows password checklist when password is typed", async () => {
    renderForm();

    await userEvent.type(
      screen.getByPlaceholderText(/min\. 8 characters/i),
      "Test",
    );

    await waitFor(() => {
      expect(
        screen.getByText(/password has at least 8 characters/i),
      ).toBeInTheDocument();

      expect(
        screen.getByText(/passwords match/i),
      ).toBeInTheDocument();
    });
  });

  it("calls register mutation with valid form data", async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText(/first name/i),
      "John",
    );

    await userEvent.type(
      screen.getByLabelText(/last name/i),
      "Doe",
    );

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "john@example.com",
    );

    await userEvent.type(
      screen.getByPlaceholderText(/min\. 8 characters/i),
      "Test1234",
    );

    await userEvent.type(
      screen.getByPlaceholderText(/confirm your password/i),
      "Test1234",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /continue/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "Test1234",
      });
    });
  });

  it("does not call mutation when passwords do not match", async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText(/first name/i),
      "John",
    );

    await userEvent.type(
      screen.getByLabelText(/last name/i),
      "Doe",
    );

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "john@example.com",
    );

    await userEvent.type(
      screen.getByPlaceholderText(/min\. 8 characters/i),
      "Test1234",
    );

    await userEvent.type(
      screen.getByPlaceholderText(/confirm your password/i),
      "Wrong999",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /continue/i }),
    );

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it("disables submit button while pending", () => {
    mockUseRegister.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useRegister>);

    renderForm();

    expect(
      screen.getByRole("button", { name: /loading/i }),
    ).toBeDisabled();
  });

  it("renders sign in link", () => {
    renderForm();

    expect(
      screen.getByRole("link", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders terms and privacy links", () => {
    renderForm();

    expect(
      screen.getByRole("link", {
        name: /terms & conditions/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /privacy policy/i,
      }),
    ).toBeInTheDocument();
  });
});