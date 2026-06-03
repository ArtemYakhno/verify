import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetMe } from "../profile.queries";
import { profileService } from "@/common/api/services/profile.service";
import { useIsAuthenticated } from "@/common/stores/auth.store";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";

vi.mock("@/common/api/services/profile.service", () => ({
  profileService: {
    getProfile: vi.fn(),
  },
}));

vi.mock("@/common/stores/auth.store", () => ({
  useIsAuthenticated: vi.fn(),
}));

const mockGetProfile = vi.mocked(profileService.getProfile);
const mockIsAuthenticated = vi.mocked(useIsAuthenticated);

beforeEach(() => vi.clearAllMocks());

describe("useGetMe", () => {
  const mockUser = { firstname: "John", lastname: "Doe", email: "john@example.com" };

  it("fetches profile when authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetProfile.mockResolvedValue(mockUser as never);

    const { result } = renderHook(() => useGetMe(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetProfile).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockUser);
  });

  it("does not fetch when not authenticated", () => {
    mockIsAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useGetMe(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetProfile).not.toHaveBeenCalled();
  });
});