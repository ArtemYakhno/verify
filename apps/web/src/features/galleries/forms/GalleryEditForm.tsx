import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { Button } from "@/common/components/ui/button";
import { handleMutationError } from "@/common/utils/handleMutationError";
import { useGetGalleryById } from "../gueries/gallery.queries";
import { useUpdateGallery } from "../gueries/gallery.mutations";
import { useGetImagesAll } from "@/features/images/gueries/images.queries";
import {
  useSoftDeleteImage,
  useUpdateImage,
} from "@/features/images/gueries/images.mutations";
import { GalleryFormHeader } from "../blocks/Form/FormHeader";
import { FormGalleryFields } from "../blocks/Form/FormGalleryFields";
import { FormImagesList } from "../blocks/Form/FormImagesList";
import { GalleryFormContainer } from "../layouts/GalleryFormContainer";
import {
  updateGallerySchema,
  type UpdateFieldsGalleryValues,
  type UpdateGalleryValues,
} from "../schemas/gallery-request.schema";

export const GalleryEditForm = () => {
  const { id } = useParams();
  const galleryId = Number(id);

  const { data: gallery, isLoading: isGalleryLoading } =
    useGetGalleryById(galleryId);

  const { data: images, isLoading: areImagesLoading } =
    useGetImagesAll(galleryId);

  const form = useForm<UpdateGalleryValues>({
    resolver: zodResolver(updateGallerySchema),
    defaultValues: {
      gallery: {
        title: "",
        description: null,
      },
      images: [],
      deletedImageIds: [],
    },
    mode: "onChange",
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!gallery || !images || initializedRef.current) {
      return;
    }

    form.reset({
      gallery: {
        title: gallery.title,
        description: gallery.description ?? null,
      },
      images: images.map((image) => ({
        id: image.id,
        path: image.path,
        name: image.name ?? null,
        comment: image.comment ?? null,
      })),
      deletedImageIds: [],
    });

    initializedRef.current = true;
  }, [gallery, images, form]);

  const { mutateAsync: updateGallery, isPending: isUpdatingGallery } =
    useUpdateGallery(galleryId);

  const { mutateAsync: updateImage, isPending: isUpdatingImage } =
    useUpdateImage();

  const { mutateAsync: softDeleteImage, isPending: isDeletingImage } =
    useSoftDeleteImage();

  const onSubmit = async (values: UpdateGalleryValues) => {
    const dirtyFields = form.formState.dirtyFields;
    if (Object.keys(dirtyFields).length === 0) {
      toast.warning('There are no changes')
      return;

    }

    let hasAnySuccess = false;

    const galleryPatch: UpdateFieldsGalleryValues = {};

    if (dirtyFields.gallery?.title) {
      galleryPatch.title = values.gallery.title;
    }

    if (dirtyFields.gallery?.description) {
      galleryPatch.description = values.gallery.description;
    }

    if (Object.keys(galleryPatch).length > 0) {
      try {
        await updateGallery(galleryPatch);
        toast.success("Gallery fields updated successfully.");
        hasAnySuccess = true;
      } catch (error) {
        toast.error("Failed to update gallery fields.");
        handleMutationError(error, form.setError, {
          title: "gallery.title",
          description: "gallery.description",
        });
      }
    }

    const deletedImageIdsSet = new Set(values.deletedImageIds);

    const dirtyImages = values.images.filter((image, index) => {
      if (deletedImageIdsSet.has(image.id)) {
        return false;
      }

      const dirtyImage = dirtyFields.images?.[index];
      return !!dirtyImage?.name || !!dirtyImage?.comment;
    });

    for (const [_, image] of dirtyImages.entries()) {
      try {
        await updateImage({
          galleryId,
          imageId: image.id,
          body: {
            name: image.name,
            comment: image.comment,
          },
        });

        toast.success(`Photo ${image.id} updated successfully.`);
        hasAnySuccess = true;
      } catch {
        toast.error(`Failed to update photo ${image.id}.`);
      }
    }

    for (const [_, imageId] of values.deletedImageIds.entries()) {
      try {
        await softDeleteImage({
          galleryId,
          imageId,
        });

        toast.success(`Photo #${imageId} deleted successfully.`);
        hasAnySuccess = true;
      } catch {
        toast.error(`Failed to delete photo #${imageId}.`);
      }
    }

    if (hasAnySuccess) {
      toast.success("Gallery update process completed.");

      form.reset({
        gallery: values.gallery,
        images: values.images.filter(
          (image) => !deletedImageIdsSet.has(image.id)
        ),
        deletedImageIds: [],
      });
    }
  };

  const isSubmitting =
    form.formState.isSubmitting ||
    isUpdatingGallery ||
    isUpdatingImage ||
    isDeletingImage;

  if (isGalleryLoading || areImagesLoading || !gallery || !images) {
    return <LoadingPlug />;
  }

  return (
    <>
      <GalleryFormHeader
        title="Edit Description"
        description="You can edit description for your gallery."
      />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <GalleryFormContainer
            sidebar={<FormGalleryFields />}
            content={<FormImagesList />}
            footer={
              <Button
                type="submit"
                disabled={isSubmitting}
                variant={form.formState.isValid ? "default" : "lightDisabled"}
                className="w-full lg:w-[250px]"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            }
          />
        </form>
      </FormProvider>
    </>
  );
};