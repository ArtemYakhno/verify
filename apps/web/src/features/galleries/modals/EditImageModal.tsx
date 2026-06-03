import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { extractErrorMessage } from "@/common/utils/erros/errors";
import { openSuccessModal } from "@/common/stores/success-modal.store";

import { useUpdateImage } from "@/features/images/gueries/images.mutations";
import {
  updateImageMetadataSchema,
  type UpdateImageMetadataValues,
} from "@/features/images/schemas/image-request.schema";
import { CustomField } from "@/common/components/ui/field-structure";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: number;
  imageId: number;
  initialName: string | null;
  initialComment: string | null;
}

export const EditImageModal = ({
  isOpen,
  onClose,
  galleryId,
  imageId,
  initialName,
  initialComment,
}: EditImageModalProps) => {
  const form = useForm<UpdateImageMetadataValues>({
    resolver: zodResolver(updateImageMetadataSchema),
    defaultValues: {
      name: initialName,
      comment: initialComment,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { isValid, errors, isSubmitting, isDirty },
  } = form;

  const { mutateAsync: updateImage, isPending } = useUpdateImage();


  const onSubmit = async (values: UpdateImageMetadataValues) => {
    if (!isDirty) {
      toast.warning('There are no changes')
      return;
    }
    try {
      await updateImage({
        galleryId,
        imageId,
        body: values,
      });

      onClose();

      openSuccessModal({
        title: "Image updated",
        description: "Image details have been successfully updated.",
      });
    } catch (error) {
      extractErrorMessage(error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    reset({
      name: initialName,
      comment: initialComment,
    });
  }, [isOpen, initialName, initialComment, reset]);

  const isLoading = isSubmitting || isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="flex flex-col  lg:max-w-[400px]">
        <DialogDescription className="sr-only">
          Here you can add or change image details.
        </DialogDescription>

        <DialogTitle className="text-center text-[24px] font-bold text-ui-black">
          Edit details
        </DialogTitle>

        <p className="typo-main mt-4 text-center text-placeholder">
          Here you can add or change details.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-7.5 flex flex-col gap-4"
        >
          <CustomField
            label="Name"
            error={errors.name?.message?.toString()}
          >
            <Input
              {...register("name")}
              placeholder="Name"
              aria-invalid={!!errors.name}
            />
          </CustomField>

          <CustomField
            label="Comment"
            error={errors.comment?.message?.toString()}
          >
            <Textarea
              {...register("comment")}
              placeholder="Type here..."
              aria-invalid={!!errors.comment}
              maxLength={100}
              defaultValue={initialComment}
              className="min-h-[170px]"
            />
          </CustomField>

          <div className="mt-2 flex flex-col items-center gap-5">
            <Button
              type="submit"
              variant={isValid ? 'default' : 'lightDisabled'}
              className="w-full"
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>

            <Button
              type="button"
              variant="cancel"
              size="auto"
              className="w-fit"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};