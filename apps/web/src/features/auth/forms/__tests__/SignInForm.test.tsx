import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { SignInForm } from "../SignInForm";
import { useLogin } from "../../queries/auth.mutations";

const mockMutate = vi.fn();

const mockUseLogin = vi.mocked(useLogin);

vi.mock("../../queries/auth.mutations", () => ({
  useLogin: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockUseLogin.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useLogin>);
});

const renderForm = () =>
  render(
    <MemoryRouter>
      <SignInForm />
    </MemoryRouter>,
  );

describe("SignInForm", () => {
  it("renders heading and fields", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: "Sign In", level: 1 }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i, { selector: "input" }),
    ).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error on empty submit", async () => {
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: /sign in/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
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
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls login mutation with valid form data", async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "user@example.com",
    );

    await userEvent.type(
      screen.getByLabelText(/password/i, { selector: "input" }),
      "Test1234",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /sign in/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Test1234",
      });
    });
  });

  it("disables submit button while pending", () => {
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useLogin>);

    renderForm();

    expect(
      screen.getByRole("button", { name: /loading/i }),
    ).toBeDisabled();
  });

  it("renders link to sign up page", () => {
    renderForm();

    expect(
      screen.getByRole("link", { name: /create an account/i }),
    ).toBeInTheDocument();
  });
});