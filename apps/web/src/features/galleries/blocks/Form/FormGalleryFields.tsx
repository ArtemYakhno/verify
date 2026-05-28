import { useFormContext } from "react-hook-form";
import { CustomField } from "@/common/components/ui/field-structure";
import { FieldGroup } from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";

type FormGalleryFieldsProps = {
  gallery: {
    title: string;
    description?: string;
  };
};

export const FormGalleryFields = () => {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<FormGalleryFieldsProps>();

  return (
    <FieldGroup className="gap-4">
      <CustomField
        label="Gallery name"
        error={errors.gallery?.title?.message?.toString()}
      >
        <Input
          {...register("gallery.title")}
          aria-invalid={!!errors.gallery?.title}
          placeholder="Gallery name"
          disabled={isSubmitting}
        />
      </CustomField>

      <CustomField
        label="Description"
        optional
        error={errors.gallery?.description?.message?.toString()}
      >
        <Textarea
          {...register("gallery.description")}
          placeholder="Type here..."
          aria-invalid={!!errors.gallery?.description}
          maxLength={255}
          disabled={isSubmitting}
        />
      </CustomField>
    </FieldGroup>
  );
};