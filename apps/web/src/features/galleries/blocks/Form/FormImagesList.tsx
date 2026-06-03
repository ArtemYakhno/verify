import { useFormContext } from "react-hook-form";
import { FormImageCard } from "./FormImageCard";
import type { UpdateGalleryValues } from "../../schemas/gallery-request.schema";
import { FormImagePlug } from "./FormImagePlug";

export const FormImagesList = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UpdateGalleryValues>();

  const images = watch("images") ?? [];
  const deletedImageIds = watch("deletedImageIds") ?? [];

  const visibleImages = images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => !deletedImageIds.includes(image.id));

  const handleDelete = (imageId: number) => {
    const nextDeletedIds = Array.from(new Set([...deletedImageIds, imageId]));
    setValue("deletedImageIds", nextDeletedIds, { shouldDirty: true });
  };

  if (!visibleImages.length) {
    return <FormImagePlug />
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        {visibleImages.map(({ image, index }) => (
          <FormImageCard
            key={image.id}
            imageSrc={image.path}
            imageAlt={`Photo ${index + 1}`}
            nameProps={register(`images.${index}.name`)}
            commentProps={register(`images.${index}.comment`)}
            nameError={errors.images?.[index]?.name?.message?.toString()}
            commentError={errors.images?.[index]?.comment?.message?.toString()}
            onDelete={() => handleDelete(image.id)}
          />
        ))}
      </div>

      <p className="typo-main text-grey">{visibleImages.length} photos available</p>
    </div>
  );
};