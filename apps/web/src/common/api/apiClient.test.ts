import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";

const { mockGetAuthState, mockSetAccessToken, mockGlobalLogout } = vi.hoisted(
  () => ({
    mockGetAuthState: vi.fn(() => ({ accessToken: null as string | null })),
    mockSetAccessToken: vi.fn(),
    mockGlobalLogout: vi.fn(),
  }),
);

const mockAxiosInstance = vi.hoisted(() =>
  Object.assign(
    vi.fn(() => Promise.resolve({ data: {} })),
    {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(),
    },
  ),
);

vi.mock("axios", () => ({
  default: { create: vi.fn(() => mockAxiosInstance) },
}));

vi.mock("@/common/stores/auth.store", () => ({
  getAuthState: mockGetAuthState,
  setAccessToken: mockSetAccessToken,
}));

vi.mock("@/common/utils/globalLogout", () => ({
  globalLogout: mockGlobalLogout,
}));

import "@/common/api/apiClient";

let requestInterceptor: (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig;
let responseErrorHandler: (error: unknown) => Promise<unknown>;

beforeAll(() => {
  requestInterceptor =
    mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
  responseErrorHandler =
    mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
});

beforeEach(() => {
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.mockReset();
  mockAxiosInstance.mockResolvedValue({ data: {} });
  mockGetAuthState.mockReturnValue({ accessToken: null });
  mockSetAccessToken.mockReset();
  mockGlobalLogout.mockReset();
});

describe("apiClient interceptors", () => {
  describe("request interceptor", () => {
    it("adds Authorization header when token exists", () => {
      mockGetAuthState.mockReturnValue({ accessToken: "valid-token" });

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe("Bearer valid-token");
    });

    it("does not add Authorization header when no token", () => {
      mockGetAuthState.mockReturnValue({ accessToken: null });

      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("response interceptor", () => {
    it("does not retry on 401 for auth routes", async () => {
      const error = {
        config: {
          url: "/auth/login",
          headers: {},
        } as InternalAxiosRequestConfig,
        response: { status: 401 },
      };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it("calls /auth/refresh and sets new token on 401", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { accessToken: "new-token" },
      });

      const error = {
        config: {
          url: "/galleries",
          headers: {},
          _retry: false,
        } as InternalAxiosRequestConfig & { _retry: boolean },
        response: { status: 401 },
      };

      await responseErrorHandler(error);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/refresh");
      expect(mockSetAccessToken).toHaveBeenCalledWith("new-token");
    });

    it("calls globalLogout when refresh fails", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Refresh failed"));

      const error = {
        config: {
          url: "/galleries",
          headers: {},
          _retry: false,
        } as InternalAxiosRequestConfig & { _retry: boolean },
        response: { status: 401 },
      };

      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(mockGlobalLogout).toHaveBeenCalled();
    });

    it("rejects immediately when config is missing", async () => {
      const error = { config: undefined, response: { status: 401 } };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);
    });
  });
});
