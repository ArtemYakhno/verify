import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { useGetGalleryById } from "../gueries/gallery.queries";
import { GalleryFormHeader } from "../blocks/Form/FormHeader";
import {
  uploadImagesSchema,
  type UploadImagesValues,
} from "@/features/images/schemas/image-request.schema";
import { GalleryUploadsFormBody } from "../layouts/GalleryUploadsFormBody";
import { useSubmitUpload } from "../hooks/useSubmitUpload";
import { buildPath } from "@/app/routes/configs/root.config";

export const GalleryUploadForm = () => {
  const { id } = useParams();
  const galleryId = Number(id);
  const navigate = useNavigate();

  const { data: gallery, isLoading } = useGetGalleryById(galleryId);

  const form = useForm<UploadImagesValues>({
    resolver: zodResolver(uploadImagesSchema),
    defaultValues: {
      uploads: [],
    },
    mode: "onChange",
  });

  const {
    uploadProgress,
    uploadFiles,
    isUploadingImages,
  } = useSubmitUpload();

  const onSubmit = async (values: UploadImagesValues) => {
    form.clearErrors("uploads");

    const uploads = values.uploads ?? [];

    const { successCount } = await uploadFiles({
      galleryId,
      uploads,
      setError: form.setError,
      onItemSuccess: (index) => {
        toast.success(`Photo ${index + 1} uploaded successfully.`);
      },
    });

    toast.success(
      `${successCount} of ${uploads.length} photos uploaded successfully.`
    );

    navigate(buildPath.galleryDetail(galleryId));


    form.reset({
      uploads: [],
    });
  };

  if (isLoading || !gallery) {
    return <LoadingPlug />;
  }

  const existingCount = gallery._count.images;

  const isSubmitting =
    form.formState.isSubmitting || isUploadingImages;

  return (
    <>
      <GalleryFormHeader
        title="Edit And Upload Photos"
        description="You can edit and upload new photos."
      />

      <FormProvider {...form}>
        <GalleryUploadsFormBody
          mode="upload"
          totalExisting={existingCount}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          isValid={form.formState.isValid}
          uploadProgress={uploadProgress}
        />
      </FormProvider>
    </>
  );
};