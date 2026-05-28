import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { RoutePath } from "@/app/routes/configs/root.config";
import { handleMutationError } from "@/common/utils/handleMutationError";
import { useCreateGallery } from "../gueries/gallery.mutations";
import { GalleryFormHeader } from "../blocks/Form/FormHeader";
import {
  createGallerySchema,
  type CreateGalleryValues,
} from "../schemas/gallery-request.schema";
import { GalleryUploadsFormBody } from "../layouts/GalleryUploadsFormBody";
import { useSubmitUpload } from "../hooks/useSubmitUpload";

export const GalleryCreateForm = () => {
  const navigate = useNavigate();

  const form = useForm<CreateGalleryValues>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      gallery: {
        title: "",
        description: undefined,
      },
      uploads: [],
    },
    mode: "onChange",
  });

  const { mutateAsync: createGallery, isPending: isCreatingGallery } =
    useCreateGallery();

  const {
    uploadProgress,
    resetUploadProgress,
    uploadFiles,
    isUploadingImages,
  } = useSubmitUpload();

  const onSubmit = async (values: CreateGalleryValues) => {
    form.clearErrors("uploads");

    try {
      const createdGallery = await createGallery(values.gallery);
      const uploads = values.uploads ?? [];

      const { successCount } = await uploadFiles({
        galleryId: createdGallery.id,
        uploads,
        setError: form.setError,
        onItemSuccess: (index) => {
          toast.success(`Photo ${index + 1} uploaded successfully.`);
        },
      });

      if (uploads.length > 0) {
        toast.success(
          `Gallery created successfully. ${successCount} of ${uploads.length} photos uploaded.`
        );
      } else {
        toast.success("A new gallery has been created in the gallery list.");
      }

      navigate(RoutePath.Galleries);
    } catch (error) {
      resetUploadProgress();

      handleMutationError(error, form.setError, {
        title: "gallery.title",
        description: "gallery.description",
      });
    }
  };

  const isSubmitting =
    form.formState.isSubmitting || isCreatingGallery || isUploadingImages;

  return (
    <>
      <GalleryFormHeader
        title="Upload Photos"
        description="You can upload one photo or a set of photos."
      />

      <FormProvider {...form}>
        <GalleryUploadsFormBody
          mode="create"
          totalExisting={0}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          isValid={form.formState.isValid}
          uploadProgress={uploadProgress}
        />
      </FormProvider>
    </>
  );
};