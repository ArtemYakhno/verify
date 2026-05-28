import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { UseFormSetError } from "react-hook-form";
import { authService } from "@/common/api/services/auth.service";
import { setAccessToken } from "@/common/stores/auth.store";
import { RoutePath } from "@/app/routes/configs/root.config";
import type {
  LoginValues,
  RegisterValues,
  RegisterDto,
} from "@/features/auth/schemas/auth.schemas";
import { handleMutationError } from "@/common/utils/handleMutationError";
import { globalLogout } from "@/common/utils/globalLogout";

export function useLogin(setError?: UseFormSetError<LoginValues>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: LoginValues) => authService.login(values),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      navigate(RoutePath.Galleries);
    },
    onError: (error) =>
      handleMutationError(error, setError, {
        email: "email",
        password: "password",
      }),
  });
}

export function useRegister(setError?: UseFormSetError<RegisterValues>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: RegisterDto) => authService.register(values),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      navigate(RoutePath.Galleries);
    },
    onError: (error) =>
      handleMutationError(error, setError, {
        firstname: "firstname",
        lastname: "lastname",
        email: "email",
        password: "password",
      }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => globalLogout(),
  });
}
