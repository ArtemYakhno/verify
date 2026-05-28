import { X } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { CustomField } from "@/common/components/ui/field-structure";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import type { UploadImagesValues } from "@/features/images/schemas/image-request.schema";
import { useFormContext } from "react-hook-form";

interface GalleryImageFormCardProps {
  imageSrc?: string;
  imageAlt: string;
  nameProps: React.ComponentProps<typeof Input>;
  commentProps: React.ComponentProps<typeof Textarea>;
  nameError?: string;
  commentError?: string;
  onDelete: () => void;
}

export const GalleryImageFormCard = ({
  imageSrc,
  imageAlt,
  nameProps,
  commentProps,
  nameError,
  commentError,
  onDelete,
}: GalleryImageFormCardProps) => {
  const {
    formState: { isSubmitting },
  } = useFormContext<UploadImagesValues>();
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg lg:grid-cols-[232px_1fr] pt-3">
      <div className="relative">
        <Button onClick={onDelete} type='button' variant="transparent" size="auto" className="p-1 rounded-circle bg-statuses absolute -top-2 -right-2">
          <X className="text-ui-black" size={16} />
        </Button>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="object-cover rounded-md aspect-square"
        />
      </div>


      <div className="flex flex-col gap-4">
        <CustomField label="Name" error={nameError}>
          <Input {...nameProps} placeholder="Name" aria-invalid={!!nameError} disabled={isSubmitting} />
        </CustomField>

        <CustomField label="Comment" error={commentError}>
          <Textarea
            {...commentProps}
            placeholder="Type here..."
            aria-invalid={!!commentError}
            maxLength={100}
            disabled={isSubmitting}
          />
        </CustomField>
      </div>
    </div>
  );
};