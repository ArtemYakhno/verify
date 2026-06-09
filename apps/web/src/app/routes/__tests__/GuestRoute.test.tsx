import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { GuestRoute } from "../GuestRoute";

const mockUseAuthStore = vi.fn();

vi.mock("@/common/stores/auth.store", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

function renderGuestRoute(initialPath = "/auth/sign-in") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/auth/sign-in" element={<div>Guest Content</div>} />
        </Route>
        <Route path="/galleries" element={<div>Galleries Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockUseAuthStore.mockReset();
});

describe("GuestRoute", () => {
  it("shows LoadingPlug while not initialized", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: false,
    });

    renderGuestRoute();

    expect(screen.getByTestId("loading-plug")).toBeInTheDocument();
  });

  it("redirects to galleries when authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isInitialized: true,
    });

    renderGuestRoute();

    expect(screen.getByText("Galleries Page")).toBeInTheDocument();
    expect(screen.queryByText("Guest Content")).not.toBeInTheDocument();
  });

  it("renders outlet when not authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isInitialized: true,
    });

    renderGuestRoute();

    expect(screen.getByText("Guest Content")).toBeInTheDocument();
  });
});