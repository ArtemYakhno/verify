import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { UseFormSetError } from "react-hook-form";
import { authService } from "@/common/api/services/auth.service";
import { logout, setAccessToken } from "@/common/stores/auth.store";
import { RoutePath } from "@/app/routes/configs/root.config";
import type {
  LoginValues,
  RegisterValues,
  RegisterDto,
} from "@/features/auth/schemas/auth.schemas";
import { handleMutationError } from "@/common/utils/handleMutationError";

export function useLogin(setError?: UseFormSetError<LoginValues>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: LoginValues) => authService.login(values),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      navigate(RoutePath.Gallery);
    },
    onError: (error) => handleMutationError(error, setError),
  });
}

export function useRegister(setError?: UseFormSetError<RegisterValues>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: RegisterDto) => authService.register(values),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      navigate(RoutePath.Gallery);
    },
    onError: (error) => handleMutationError(error, setError),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
