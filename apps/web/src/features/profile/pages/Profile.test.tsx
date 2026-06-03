import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Profile } from "./Profile";
import { useGetMe } from "../queries/profile.queries";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";
import type { User } from "@/common/types/User";
import type { UseQueryResult } from "@tanstack/react-query";

vi.mock("../queries/profile.queries", () => ({
  useGetMe: vi.fn(),
}));

const mockUseGetMe = vi.mocked(useGetMe);

describe("Profile", () => {
  it("renders LoadingPlug while loading", () => {
    mockUseGetMe.mockReturnValue({ data: undefined, isLoading: true } as unknown as UseQueryResult<User>);

    render(<Profile />, { wrapper: createWrapper() });

    expect(screen.getByTestId("loading-plug")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-header")).not.toBeInTheDocument();
  });

  it("renders 'User not found' when data is undefined", () => {
    mockUseGetMe.mockReturnValue({ data: undefined, isLoading: false } as unknown as UseQueryResult<User>);

    render(<Profile />, { wrapper: createWrapper() });

    expect(screen.getByText("User not found.")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-header")).not.toBeInTheDocument();
  });

  it("renders all sections when user is loaded", () => {
    mockUseGetMe.mockReturnValue({
      data: { firstname: "John", lastname: "Doe", email: "john@example.com" },
      isLoading: false,
    } as unknown as UseQueryResult<User>);

    render(<Profile />, { wrapper: createWrapper() });

    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("account-form")).toBeInTheDocument();
    expect(screen.getByTestId("password-form")).toBeInTheDocument();
  });

  it("passes correct props to ProfileHeader", () => {
    mockUseGetMe.mockReturnValue({
      data: { firstname: "John", lastname: "Doe", email: "john@example.com" },
      isLoading: false,
    } as unknown as UseQueryResult<User>);

    render(<Profile />, { wrapper: createWrapper() });

    expect(screen.getByTestId("profile-header")).toHaveTextContent("JD");
  });
});