import {
  authResponseSchema,
  type LoginValues,
  type RegisterDto,
} from "@/features/auth/schemas/auth.schemas";
import { apiClient } from "../apiClient";
import { parseApiResponse } from "@/common/utils/erros/parse-api-response";

export const authService = {
  register: async (body: RegisterDto) => {
    const { data } = await apiClient.post("/auth/register", body);
    return parseApiResponse(authResponseSchema, data);
  },
  login: async (body: LoginValues) => {
    const { data } = await apiClient.post("/auth/login", body);
    return parseApiResponse(authResponseSchema, data);
  },
  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    return parseApiResponse(authResponseSchema, data);
  },
  logout: async () => {
    await apiClient.post("/auth/logout");
  },
};
