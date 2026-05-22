import { useFormContext } from "react-hook-form";
import { CustomField } from "@/common/components/ui/field-structure";
import { FieldGroup } from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";

type GalleryFormValues = {
  title: string;
  description?: string;
};

export const GalleryInfoFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<GalleryFormValues>();

  return (
    <FieldGroup className="gap-4">
      <CustomField
        label="Gallery name"
        error={errors.title?.message?.toString()}
      >
        <Input
          {...register("title")}
          aria-invalid={!!errors.title}
          placeholder="Gallery name"
        />
      </CustomField>

      <CustomField
        label="Description"
        optional
        error={errors.description?.message?.toString()}
      >
        <Textarea
          {...register("description")}
          placeholder="Type here..."
          aria-invalid={!!errors.description}
          maxLength={255}
        />
      </CustomField>
    </FieldGroup>
  );
};