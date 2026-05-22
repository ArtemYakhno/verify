import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { MAX_FILES } from "@/features/images/constants/image.constants";
import {
  imageFileSchema,
  type UploadImageItemValues,
  type UploadImagesValues,
} from "@/features/images/schemas/image-request.schema";
import { useGalleryUploadsStore } from "../stores/gallery-uploads.store";

type UseGalleryUploadsProps = {
  totalExisting?: number;
};

export const useUploads = ({
  totalExisting = 0,
}: UseGalleryUploadsProps = {}) => {
  const { control, watch, clearErrors } = useFormContext<UploadImagesValues>();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "uploads",
  });

  const uploads = watch("uploads") ?? [];

  const { ensurePreviews, getPreviewUrl, removePreview, clearPreviews } =
    useGalleryUploadsStore();

  useEffect(() => {
    return () => {
      clearPreviews();
    };
  }, [clearPreviews]);

  const totalCount = totalExisting + fields.length;
  const isDisabled = totalCount >= MAX_FILES;

  const handleFiles = (incomingFiles: FileList | File[]) => {
    if (isDisabled) {
      toast.warning(`Warning. Can't upload more than ${MAX_FILES} photos.`);
      return;
    }

    const files = Array.from(incomingFiles);
    if (!files.length) return;

    const availableSlots = MAX_FILES - totalCount;

    if (files.length > availableSlots) {
      toast.warning(
        `Only ${availableSlots} more photo${availableSlots > 1 ? "s are" : " is"} allowed.`,
      );
    }

    const acceptedFiles = files.slice(0, availableSlots);
    const uploadsToAppend: UploadImageItemValues[] = [];

    acceptedFiles.forEach((file, index) => {
      const result = imageFileSchema.safeParse(file);

      if (!result.success) {
        const message =
          result.error.issues[0]?.message ?? "Invalid image file.";
        toast.warning(`Photo ${index + 1}: ${message}`);
        return;
      }

      uploadsToAppend.push({
        file,
        name: null,
        comment: null,
      });
    });

    if (!uploadsToAppend.length) return;

    clearErrors("uploads");
    append(uploadsToAppend);
    ensurePreviews(uploadsToAppend.map((item) => item.file));
  };

  const handleRemove = (index: number) => {
    const file = uploads[index]?.file;
    removePreview(file);
    remove(index);
  };

  const handleDeleteAll = () => {
    clearPreviews();
    replace([]);
  };

  return {
    fields,
    uploads,
    totalCount,
    isDisabled,
    handleFiles,
    handleRemove,
    handleDeleteAll,
    getPreviewUrl,
  };
};
