import { useMutation } from "@tanstack/react-query";
import { profileService } from "@/common/api/services/profile.service";
import type {
  ChangePasswordDto,
  ChangePasswordValues,
  UpdateProfileValues,
} from "../schemas/profile.schema";
import type { UseFormSetError } from "react-hook-form";
import { handleMutationError } from "@/common/utils/handleMutationError";

export const useUpdateProfile = (
  setError?: UseFormSetError<UpdateProfileValues>,
) => {
  return useMutation({
    mutationFn: (body: UpdateProfileValues) =>
      profileService.updateProfile(body),
    onError: (error) => handleMutationError(error, setError),
  });
};

export const useChangePassword = (
  setError?: UseFormSetError<ChangePasswordValues>,
) => {
  return useMutation({
    mutationFn: (body: ChangePasswordDto) =>
      profileService.changePassword(body),
    onError: (error) => handleMutationError(error, setError),
  });
};
