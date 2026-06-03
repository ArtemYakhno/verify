import { Button } from "@/common/components/ui/button";
import { FormUploadsList } from "../blocks/Form/FormUploadsList";
import { FormGalleryFields } from "../blocks/Form/FormGalleryFields";
import { FormUploader } from "../blocks/Form/FormUploader";
import { GalleryFormContainer } from "./GalleryFormContainer";
import { useUploads } from "../hooks/useUploads";
import type { UploadProgressState } from "../types/upload-progress";

type GalleryUploadsFormMode = "create" | "upload";

type GalleryUploadsFormBodyProps = {
  mode: GalleryUploadsFormMode;
  totalExisting: number;
  onSubmit: React.ComponentProps<"form">["onSubmit"];
  isSubmitting: boolean;
  isValid: boolean;
  uploadProgress: UploadProgressState;

};

export const GalleryUploadsFormBody = ({
  mode,
  totalExisting,
  onSubmit,
  isSubmitting,
  isValid,
  uploadProgress
}: GalleryUploadsFormBodyProps) => {
  const {
    fields,
    uploads,
    isDisabled,
    handleFiles,
    handleRemove,
    handleDeleteAll,
    getPreviewUrl,
  } = useUploads({ totalExisting });

  const submitLabel =
    mode === "create"
      ? isSubmitting
        ? "Creating..."
        : "Create a new gallery"
      : isSubmitting
        ? "Uploading..."
        : "Upload photos";

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1">
      <GalleryFormContainer
        sidebar={
          <>
            <FormUploader
              isDisabled={isDisabled}
              onFilesSelect={handleFiles}
              uploadProgress={uploadProgress}
            />
            {mode === "create" && <FormGalleryFields />}
          </>
        }
        content={
          <FormUploadsList
            fields={fields}
            uploads={uploads}
            totalExisting={totalExisting}
            onRemove={handleRemove}
            onDeleteAll={handleDeleteAll}
            getPreviewUrl={getPreviewUrl}
          />
        }
        footer={
          <Button
            type="submit"
            disabled={isSubmitting}
            variant={isValid ? "default" : "lightDisabled"}
            className="w-full lg:w-[250px]"
          >
            {submitLabel}
          </Button>
        }
      />
    </form>
  );
};