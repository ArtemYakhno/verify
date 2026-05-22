import type { User } from "@/common/types/User";
import { apiClient } from "../apiClient";
import { parseApiResponse } from "@/common/utils/parse-api-response";
import { userSchema } from "@/common/schemas/user.schemas";
import type {
  ChangePasswordDto,
  UpdateProfileValues,
} from "@/features/profile/schemas/profile.schema";

export const profileService = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get("/profile");
    return parseApiResponse(userSchema, data);
  },

  updateProfile: async (body: UpdateProfileValues): Promise<User> => {
    const { data } = await apiClient.patch("/profile", body);
    return parseApiResponse(userSchema, data);
  },

  changePassword: async (body: ChangePasswordDto): Promise<void> => {
    await apiClient.patch("/profile/password", body);
  },

  deleteProfile: async (): Promise<void> => {
    await apiClient.delete("/profile");
  },
};
