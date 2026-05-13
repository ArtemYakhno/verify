import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/common/api/services/profile.service";
import type {
  ChangePasswordDto,
  ChangePasswordValues,
  UpdateProfileValues,
} from "../schemas/profile.schema";
import type { UseFormSetError } from "react-hook-form";
import { handleMutationError } from "@/common/utils/handleMutationError";
import { profileKeys } from "./profile.keys";

export const useUpdateProfile = (
  setError?: UseFormSetError<UpdateProfileValues>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileValues) =>
      profileService.updateProfile(body),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(profileKeys.me(), updatedUser);
    },
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
