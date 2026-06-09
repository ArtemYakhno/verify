import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogin, useLogout, useRegister } from "./auth.mutations";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";
import { authService } from "@/common/api/services/auth.service";
import { setAccessToken } from "@/common/stores/auth.store";
import { globalLogout } from "@/common/utils/globalLogout";
import { handleMutationError } from "@/common/utils/erros/handleMutationError";

vi.mock("@/common/api/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("@/common/stores/auth.store", () => ({
  setAccessToken: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/common/utils/globalLogout", () => ({
  globalLogout: vi.fn(),
}));

vi.mock("@/common/utils/erros/handleMutationError", () => ({
  handleMutationError: vi.fn(),
}));

const mockLogin = vi.mocked(authService.login);
const mockRegister = vi.mocked(authService.register);
const mockLogout = vi.mocked(authService.logout);
const mockSetAccessToken = vi.mocked(setAccessToken);
const mockGlobalLogout = vi.mocked(globalLogout);
const mockHandleMutationError = vi.mocked(handleMutationError);
const mockNavigate = vi.hoisted(() => vi.fn());


beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth.mutations", () => {

  describe("useLogin", () => {
    const credentials = { email: "test@test.com", password: "Test1234" };

    it("calls authService.login with correct values", async () => {
      mockLogin.mockResolvedValue({ accessToken: "token-abc" });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(credentials);
      });

      expect(mockLogin).toHaveBeenCalledWith(credentials);
    });

    it("sets access token and navigates on success", async () => {
      mockLogin.mockResolvedValue({ accessToken: "token-abc" });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(credentials);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("token-abc");
      expect(mockNavigate).toHaveBeenCalledWith("/galleries");
    });

    it("calls handleMutationError with field map on error", async () => {
      mockLogin.mockRejectedValue(new Error("Unauthorized"));

      const mockSetError = vi.fn();
      const { result } = renderHook(() => useLogin(mockSetError), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(credentials);
      });

      expect(mockHandleMutationError).toHaveBeenCalledWith(
        expect.any(Error),
        mockSetError,
        { email: "email", password: "password" },
      );
    });

    it("does not navigate on error", async () => {
      mockLogin.mockRejectedValue(new Error("Unauthorized"));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(credentials);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("useRegister", () => {
    const registerData = {
      firstname: "John",
      lastname: "Doe",
      email: "john@test.com",
      password: "Test1234",
    };

    it("calls authService.register with correct values", async () => {
      mockRegister.mockResolvedValue({ accessToken: "token-xyz" });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(registerData);
      });

      expect(mockRegister).toHaveBeenCalledWith(registerData);
    });

    it("sets access token and navigates on success", async () => {
      mockRegister.mockResolvedValue({ accessToken: "token-xyz" });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(registerData);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("token-xyz");
      expect(mockNavigate).toHaveBeenCalledWith("/galleries");
    });

    it("calls handleMutationError with field map on error", async () => {
      mockRegister.mockRejectedValue(new Error("Conflict"));

      const mockSetError = vi.fn();
      const { result } = renderHook(() => useRegister(mockSetError), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate(registerData);
      });

      expect(mockHandleMutationError).toHaveBeenCalledWith(
        expect.any(Error),
        mockSetError,
        {
          firstname: "firstname",
          lastname: "lastname",
          email: "email",
          password: "password",
        },
      );
    });
  });

  describe("useLogout", () => {
    it("calls authService.logout on mutate", async () => {
      mockLogout.mockResolvedValue({} as never);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it("calls globalLogout on success", async () => {
      mockLogout.mockResolvedValue({} as never);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      expect(mockGlobalLogout).toHaveBeenCalled();
    });

    it("calls globalLogout even when logout request fails", async () => {
      mockLogout.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      expect(mockGlobalLogout).toHaveBeenCalled();
    });
  });

});