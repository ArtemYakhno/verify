import type { AxiosError } from "axios";
import type { ZodError } from "zod";

export class ApiValidationError extends Error {
  readonly zodError: ZodError;

  constructor(message: string, zodError: ZodError) {
    super(message);
    this.name = "ApiValidationError";
    this.zodError = zodError;
  }
}

interface BackendErrorBody {
  message?: string;
  error?: string;
  statusCode?: number;
  [field: string]: string | string[] | number | undefined;
}

const RESERVED_KEYS = new Set(["message", "error", "statusCode"]);

export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return "Server returned unexpected data. Please try again later.";
  }

  const axiosError = error as AxiosError<BackendErrorBody>;

  if (!axiosError.response) {
    return "No server connection. Please check your network.";
  }

  const data = axiosError.response.data;

  if (typeof data?.message === "string") {
    return data.message;
  }

  return "An unknown error occurred.";
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  const data = (error as AxiosError<BackendErrorBody>)?.response?.data;
  if (!data) return {};

  const result: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (RESERVED_KEYS.has(key)) return;
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value[0];
    }
  });

  return result;
}