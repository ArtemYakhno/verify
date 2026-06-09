import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUpdateProfile, useChangePassword } from "../profile.mutations";
import { profileService } from "@/common/api/services/profile.service";
import { profileKeys } from "../profile.keys";
import { handleMutationError } from "@/common/utils/erros/handleMutationError";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";

vi.mock("@/common/api/services/profile.service", () => ({
  profileService: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock("@/common/utils/erros/handleMutationError", () => ({
  handleMutationError: vi.fn(),
}));

const mockService = vi.mocked(profileService);
const mockHandleMutationError = vi.mocked(handleMutationError);

beforeEach(() => vi.clearAllMocks());

describe("useUpdateProfile", () => {
  it("calls profileService.updateProfile with correct body", async () => {
    const updatedUser = { firstname: "Jane", lastname: "Doe" };
    mockService.updateProfile.mockResolvedValue(updatedUser as never);

    const { wrapper } = createWrapper({ exposeClient: true });
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(() => result.current.mutateAsync(updatedUser));

    expect(mockService.updateProfile).toHaveBeenCalledWith(updatedUser);
  });

  it("sets query cache with updated user on success", async () => {
    const updatedUser = { firstname: "Jane", lastname: "Doe" };
    mockService.updateProfile.mockResolvedValue(updatedUser as never);

    const { queryClient, wrapper } = createWrapper({ exposeClient: true });
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(() => result.current.mutateAsync(updatedUser));

    await waitFor(() => {
      expect(queryClient.getQueryData(profileKeys.me())).toEqual(updatedUser);
    });
  });

  it("calls handleMutationError on error", async () => {
    const error = new Error("Server error");
    mockService.updateProfile.mockRejectedValue(error);

    const setError = vi.fn();
    const { wrapper } = createWrapper({ exposeClient: true });
    const { result } = renderHook(() => useUpdateProfile(setError as never), {
      wrapper,
    });

    await act(() =>
      result.current.mutate({ firstname: "Jane", lastname: "Doe" }),
    );

    await waitFor(() => {
      expect(mockHandleMutationError).toHaveBeenCalledWith(error, setError, {
        firstname: "firstname",
        lastname: "lastname",
      });
    });
  });
});

describe("useChangePassword", () => {
  const body = {
    currentPassword: "OldPass1",
    newPassword: "NewPass1",
  };

  it("calls profileService.changePassword with correct body", async () => {
    mockService.changePassword.mockResolvedValue(undefined as never);

    const { wrapper } = createWrapper({ exposeClient: true });
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    await act(() => result.current.mutateAsync(body));

    expect(mockService.changePassword).toHaveBeenCalledWith(body);
  });

  it("calls handleMutationError on error", async () => {
    const error = new Error("Wrong password");
    mockService.changePassword.mockRejectedValue(error);

    const setError = vi.fn();
    const { wrapper } = createWrapper({ exposeClient: true });
    const { result } = renderHook(() => useChangePassword(setError as never), {
      wrapper,
    });

    await act(() => result.current.mutate(body));

    await waitFor(() => {
      expect(mockHandleMutationError).toHaveBeenCalledWith(error, setError, {
        currentPassword: "currentPassword",
        newPassword: "newPassword",
      });
    });
  });
});
