import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";

const mockUseAuthStore = vi.fn();

vi.mock("@/common/stores/auth.store", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

function renderProtectedRoute(initialPath = "/protected") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/auth/sign-in" element={<div>Sign In Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockUseAuthStore.mockReset();
});

describe("ProtectedRoute", () => {
  it("shows LoadingPlug while not initialized", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: false,
    });

    renderProtectedRoute();

    expect(screen.getByTestId("loading-plug")).toBeInTheDocument();
  });

  it("redirects to sign-in when not authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: true,
    });

    renderProtectedRoute();

    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders outlet when authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    });

    renderProtectedRoute();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});