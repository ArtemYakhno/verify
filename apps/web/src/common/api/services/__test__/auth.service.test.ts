import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../auth.service";
import { apiClient } from "../../apiClient";



vi.mock("@/common/api/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock("@/common/utils/erros/parse-api-response", () => ({
  parseApiResponse: vi.fn((_schema, data) => data),
}));

const mockPost = vi.mocked(apiClient.post);

beforeEach(() => {
  mockPost.mockReset();
});

describe("authService", () => {
  describe("login", () => {
    it("calls POST /auth/login with correct body", async () => {
      mockPost.mockResolvedValue({ data: { accessToken: "abc123" } });

      await authService.login({ email: "test@test.com", password: "12345678" });

      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "12345678",
      });
    });

    it("login:returns parsed response", async () => {
      mockPost.mockResolvedValue({ data: { accessToken: "abc123" } });

      const result = await authService.login({
        email: "test@test.com",
        password: "12345678",
      });

      expect(result).toEqual({ accessToken: "abc123" });
    });
  });

  describe("register", () => {
    it("calls POST /auth/register with correct body", async () => {
      mockPost.mockResolvedValue({ data: { accessToken: "xyz" } });

      await authService.register({
        firstname: "John",
        lastname: "Doe",
        email: "john@test.com",
        password: "Test1234",
      });

      expect(mockPost).toHaveBeenCalledWith("/auth/register", {
        firstname: "John",
        lastname: "Doe",
        email: "john@test.com",
        password: "Test1234",
      });
    });
  });

  describe("refresh", () => {
    it("calls POST /auth/refresh", async () => {
      mockPost.mockResolvedValue({});

      await authService.refresh();

      expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
    });
  });

  describe("logout", () => {
    it("calls POST /auth/logout", async () => {
      mockPost.mockResolvedValue({});

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });
  });
});
