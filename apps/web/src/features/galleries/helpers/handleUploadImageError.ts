import type { UseFormSetError } from "react-hook-form";
import { extractFieldErrors, extractErrorMessage } from "@/common/utils/errors";
import { toast } from "sonner";
import type { CreateGalleryValues } from "../schemas/gallery-request.schema";

export function handleUploadImageError(
  error: unknown,
  index: number,
  setError: UseFormSetError<CreateGalleryValues>,
) {
  const fieldErrors = extractFieldErrors(error);

  let mappedCount = 0;

  Object.entries(fieldErrors).forEach(([backendField, message]) => {
    if (backendField === "name" || backendField === "comment") {
      setError(`uploads.${index}.${backendField}`, {
        type: "server",
        message,
      });
      mappedCount += 1;
    }
  });

  const hasUnmappedErrors =
    Object.keys(fieldErrors).length === 0 ||
    mappedCount < Object.keys(fieldErrors).length;

  toast.error(
    `Photo ${index + 1} failed to upload${
      hasUnmappedErrors ? `: ${extractErrorMessage(error)}` : "."
    }`,
  );
}
