import { useFormContext, type FieldArrayWithId } from "react-hook-form";
import { MAX_FILES } from "@/features/images/constants/image.constants";
import { GalleryImageFormCard } from "./FormImageCard";
import type { UploadImageItemValues, UploadImagesValues } from "@/features/images/schemas/image-request.schema";
import { FormImagePlug } from "./FormImagePlug";
import { Button } from "@/common/components/ui/button";


type FormUploadsListProps = {
  fields: FieldArrayWithId<UploadImagesValues, "uploads", "id">[];
  uploads: UploadImageItemValues[];
  totalExisting: number;
  onRemove: (index: number) => void;
  onDeleteAll: () => void;
  getPreviewUrl: (file?: File) => string | undefined;
};

export const FormUploadsList = ({
  fields,
  uploads,
  totalExisting,
  onRemove,
  onDeleteAll,
  getPreviewUrl,
}: FormUploadsListProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<UploadImagesValues>();

  if (!fields.length) {
    return (
      <FormImagePlug withAdditionalInfo />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        {fields.map((field, index) => {
          const file = uploads[index]?.file;
          const previewUrl = getPreviewUrl(file);

          return (
            <GalleryImageFormCard
              key={field.id}
              imageSrc={previewUrl}
              imageAlt={`Preview ${index + 1}`}
              nameProps={register(`uploads.${index}.name`)}
              commentProps={register(`uploads.${index}.comment`)}
              nameError={errors.uploads?.[index]?.name?.message?.toString()}
              commentError={errors.uploads?.[index]?.comment?.message?.toString()}
              onDelete={() => onRemove(index)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="transparent"
          size="auto"
          className="typo-main text-green"
          onClick={onDeleteAll}
        >
          Delete All
        </Button>

        <p className="typo-main text-grey">
          {uploads.length}/{MAX_FILES - totalExisting} photos selected
        </p>
      </div>
    </div>
  );
};