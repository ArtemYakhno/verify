import { useRef, type DragEvent } from "react";
import { Check, Images, Upload, X } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Progress } from "@/common/components/ui/progress";
import { cn } from "@/common/lib/utils";
import { MAX_FILES } from "@/features/images/constants/image.constants";
import type { UploadProgressState } from "../../types/upload-progress";
import { useFormContext } from "react-hook-form";
import type { UploadImagesValues } from "@/features/images/schemas/image-request.schema";

type FormUploaderProps = {
  isDisabled: boolean;
  onFilesSelect: (files: FileList | File[]) => void;
  uploadProgress?: UploadProgressState;
};

const formatFileSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)}MB`;
};

export const FormUploader = ({
  isDisabled,
  onFilesSelect,
  uploadProgress,
}: FormUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    formState: { isSubmitting },
  } = useFormContext<UploadImagesValues>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    onFilesSelect(selectedFiles);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDisabled) return;

    if (event.dataTransfer.files?.length) {
      onFilesSelect(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const isError = uploadProgress?.status === "error";
  const isSuccess = uploadProgress?.status === "success";

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "flex flex-col items-center justify-center gap-5 rounded-lg border border-dashed p-9 box-border transition-colors",
          isDisabled ? "border-red bg-transparent" : "border-green"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={isDisabled || isSubmitting}
        />

        <Images className="text-placeholder" size={64} />

        <div>
          <h3 className={cn("typo-h3 text-center", isDisabled && "text-ui-black")}>
            {isDisabled
              ? `Can't upload more than ${MAX_FILES} photos`
              : "Drag and drop photo here"}
          </h3>
          <p className={cn("typo-third text-center mt-2.5", isDisabled && "text-grey")}>
            {isDisabled
              ? "Please, free up some space and try again."
              : "JPEG, PNG, WEBP (max 5MB / picture)"}
          </p>
        </div>

        {!isDisabled && (
          <>
            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-border" />
              <span className="typo-h3 text-placeholder">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              className="w-full gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={isDisabled}
              variant="default"
            >
              <Upload size={24} />
              Upload
            </Button>
          </>
        )}
      </div>

      {uploadProgress && uploadProgress.isVisible && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="typo-main font-medium truncate">
              {isError
                ? "Failed to load"
                : isSuccess
                  ? "Completed!"
                  : uploadProgress.fileName}
            </p>
            {isError && <div className="p-1 rounded-circle bg-light-error"><X size={14} className="text-red" /></div>}
            {isSuccess && <div className="p-1 rounded-circle bg-light-green"><Check size={14} className="text-green" /></div>}
          </div>

          <Progress
            value={isError ? 0 : uploadProgress.progress}
            className={cn(
              isError && "[&>[data-slot=progress-indicator]]:bg-red"
            )}
          />

          <div className="flex items-center justify-between">
            <p className="typo-main text-grey">
              {formatFileSize(uploadProgress.fileSize)}
            </p>
            <p className="typo-main text-grey">
              {isError ? "0%" : `${uploadProgress.progress}%`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};