import { describe, it, expect, vi, beforeEach } from "vitest";
import { profileService } from "../profile.service";
import { apiClient } from "../../apiClient";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/common/utils/erros/parse-api-response", () => ({
  parseApiResponse: vi.fn((_schema, data) => data),
}));

const mockGet = vi.mocked(apiClient.get);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const mockUser = {
  id: 1,
  firstname: "John",
  lastname: "Doe",
  email: "john@test.com",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("profileService", () => {
  describe("getProfile", () => {
    it("calls GET /profile", async () => {
      mockGet.mockResolvedValue({ data: mockUser });

      await profileService.getProfile();

      expect(mockGet).toHaveBeenCalledWith("/profile");
    });

    it("returns parsed user", async () => {
      mockGet.mockResolvedValue({ data: mockUser });

      const result = await profileService.getProfile();

      expect(result).toEqual(mockUser);
    });
  });

  describe("updateProfile", () => {
    const updateBody = { firstname: "Jane", lastname: "Smith" };

    it("calls PATCH /profile with correct body", async () => {
      mockPatch.mockResolvedValue({ data: { ...mockUser, ...updateBody } });

      await profileService.updateProfile(updateBody);

      expect(mockPatch).toHaveBeenCalledWith("/profile", updateBody);
    });

    it("returns updated user", async () => {
      const updatedUser = { ...mockUser, ...updateBody };
      mockPatch.mockResolvedValue({ data: updatedUser });

      const result = await profileService.updateProfile(updateBody);

      expect(result).toEqual(updatedUser);
    });
  });

  describe("changePassword", () => {
    const passwordBody = {
      currentPassword: "OldPass123",
      newPassword: "NewPass456",
    };

    it("calls PATCH /profile/password with correct body", async () => {
      mockPatch.mockResolvedValue({});

      await profileService.changePassword(passwordBody);

      expect(mockPatch).toHaveBeenCalledWith("/profile/password", passwordBody);
    });

    it("returns void", async () => {
      mockPatch.mockResolvedValue({});

      const result = await profileService.changePassword(passwordBody);

      expect(result).toBeUndefined();
    });
  });

  describe("deleteProfile", () => {
    it("calls DELETE /profile", async () => {
      mockDelete.mockResolvedValue({});

      await profileService.deleteProfile();

      expect(mockDelete).toHaveBeenCalledWith("/profile");
    });

    it("returns void", async () => {
      mockDelete.mockResolvedValue({});

      const result = await profileService.deleteProfile();

      expect(result).toBeUndefined();
    });
  });
});
