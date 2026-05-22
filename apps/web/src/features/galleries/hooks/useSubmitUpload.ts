import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";

import { useUploadImage } from "@/features/images/gueries/images.mutations";
import type {
  UploadImagesValues,
  UploadImageItemValues,
} from "@/features/images/schemas/image-request.schema";
import { handleUploadImageError } from "../helpers/handleUploadImageError";
import type { UploadProgressState } from "../types/upload-progress";

const initialUploadProgress: UploadProgressState = {
  isVisible: false,
  fileName: null,
  fileSize: 0,
  progress: 0,
  status: "idle",
};

type UploadFilesParams = {
  galleryId: number;
  uploads: UploadImageItemValues[];
  setError: UseFormSetError<UploadImagesValues>;
  onItemSuccess?: (index: number) => void;
};

export const useSubmitUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>(
    initialUploadProgress,
  );

  const { mutateAsync: uploadImage, isPending: isUploadingImages } =
    useUploadImage();

  const resetUploadProgress = () => {
    setUploadProgress(initialUploadProgress);
  };

  const uploadFiles = async ({
    galleryId,
    uploads,
    setError,
    onItemSuccess,
  }: UploadFilesParams) => {
    let successCount = 0;

    for (const [index, upload] of uploads.entries()) {
      setUploadProgress({
        isVisible: true,
        fileName: upload.file.name,
        fileSize: upload.file.size,
        progress: 0,
        status: "uploading",
      });

      try {
        await uploadImage({
          galleryId,
          body: upload,
          onProgress: (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              progress,
              status: "uploading",
            }));
          },
        });

        setUploadProgress((prev) => ({
          ...prev,
          progress: 100,
          status: "success",
        }));

        successCount += 1;
        onItemSuccess?.(index);
      } catch (error) {
        setUploadProgress((prev) => ({
          ...prev,
          progress: 0,
          status: "error",
        }));

        handleUploadImageError(error, index, setError);
      }
    }

    return { successCount };
  };

  return {
    uploadProgress,
    resetUploadProgress,
    uploadFiles,
    isUploadingImages,
  };
};
