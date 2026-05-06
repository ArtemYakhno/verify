import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { extractErrorMessage, extractFieldErrors } from "./errors";

export function handleMutationError<T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
) {
  const fieldErrors = extractFieldErrors(error);

  if (setError && Object.keys(fieldErrors).length > 0) {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field as Path<T>, {
        type: "server",
        message,
      });
    });
    return;
  }

  toast.error(extractErrorMessage(error));
}