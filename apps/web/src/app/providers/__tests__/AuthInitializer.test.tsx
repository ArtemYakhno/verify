import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthInitializer } from "../AuthInitializer";
import { setAccessToken, setInitialized } from "@/common/stores/auth.store";
import { globalLogout } from "@/common/utils/globalLogout";
import { authService } from "@/common/api/services/auth.service";
import { profileService } from "@/common/api/services/profile.service";

const mockProfile = {
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
  email: 'test@test.com',
  role: 'USER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("../../../common/api/services/auth.service", () => ({
  authService: {
    refresh: vi.fn(),
  },
}));

vi.mock("../../../common/api/services/profile.service", () => ({
  profileService: {
    getProfile: vi.fn(),
  },
}));

vi.mock("../../../common/stores/auth.store", () => ({
  setAccessToken: vi.fn(),
  setInitialized: vi.fn(),
}));

vi.mock("@/common/utils/globalLogout", () => ({
  globalLogout: vi.fn(),
}));

const mockRefresh = vi.mocked(authService.refresh);
const mockGetProfile = vi.mocked(profileService.getProfile);
const mockSetAccessToken = vi.mocked(setAccessToken);
const mockSetInitialized = vi.mocked(setInitialized);
const mockGlobalLogout = vi.mocked(globalLogout);


function renderComponent() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, gcTime: 0,
        staleTime: 0
      },
    },
  });

  return render(
    <QueryClientProvider client={qc}>
      <AuthInitializer>
        <div>app content</div>
      </AuthInitializer>
    </QueryClientProvider>,
  );
}


beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthInitializer", () => {

  it("renders children", () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockResolvedValue(mockProfile);

    const { getByText } = renderComponent();

    expect(getByText("app content")).toBeInTheDocument();
  });

  it("calls refresh on mount", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockResolvedValue(mockProfile);

    renderComponent();

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledOnce();
    });
  });

  it("sets access token after successful refresh", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token-abc" });
    mockGetProfile.mockResolvedValue(mockProfile);

    renderComponent();

    await waitFor(() => {
      expect(mockSetAccessToken).toHaveBeenCalledWith("token-abc");
    });
  });

  it("fetches profile after successful refresh", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockResolvedValue(mockProfile);

    renderComponent();

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });
  });

  it("calls setInitialized after successful flow", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockResolvedValue(mockProfile);

    renderComponent();

    await waitFor(() => {
      expect(mockSetInitialized).toHaveBeenCalled();
    });
  });

  it("calls globalLogout when refresh fails", async () => {
    mockRefresh.mockRejectedValue(new Error("Unauthorized"));

    renderComponent();

    await waitFor(() => {
      expect(mockGlobalLogout).toHaveBeenCalled();
    });
  });

  it("calls globalLogout when profile fetch fails", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockRejectedValue(new Error("Profile error"));

    renderComponent();

    await waitFor(() => {
      expect(mockGlobalLogout).toHaveBeenCalled();
    });
  });

  it("calls setInitialized even when refresh fails", async () => {
    mockRefresh.mockRejectedValue(new Error("Unauthorized"));

    renderComponent();

    await waitFor(() => {
      expect(mockSetInitialized).toHaveBeenCalled();
    });
  });

  it("calls setInitialized even when profile fetch fails", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockRejectedValue(new Error("Profile error"));

    renderComponent();

    await waitFor(() => {
      expect(mockSetInitialized).toHaveBeenCalled();
    });
  });

  it("does not call globalLogout on success", async () => {
    mockRefresh.mockResolvedValue({ accessToken: "token" });
    mockGetProfile.mockResolvedValue(mockProfile);

    renderComponent();

    await waitFor(() => {
      expect(mockSetInitialized).toHaveBeenCalled();
    });

    expect(mockGlobalLogout).not.toHaveBeenCalled();
  });

});