import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import {
  updateGallerySchema,
  type UpdateGalleryValues,
} from "../schemas/gallery-dto.schema";

import { useGetGalleryById } from "../gueries/gallery.queries";
import { useUpdateGallery } from "../gueries/gallery.mutations";

import { LoadingPlug } from "@/common/components/ui/loading-plug";
import { Button } from "@/common/components/ui/button";

import { GalleryFormHeader } from "../blocks/forms/GalleryFormHeader";
import { GalleryInfoFields } from "../blocks/forms/GalleryInfoFields";
import { GalleryPhotoPlug } from "../blocks/forms/GalleryPhotoPlug";

import { GalleryFormContainer } from "../layouts/GalleryFormContainer";

import { toast } from "sonner";

export const GalleryEditForm = () => {
  const { id } = useParams();
  const galleryId = Number(id);
  const {
    data: gallery,
    isLoading,
  } = useGetGalleryById(galleryId);

  const form = useForm<UpdateGalleryValues>({
    resolver: zodResolver(updateGallerySchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onSubmit",
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!gallery || initializedRef.current) {
      return;
    }

    form.reset({
      title: gallery.title,
      description: gallery.description ?? "",
    });

    initializedRef.current = true;
  }, [gallery, form]);

  const {
    mutateAsync: updateGallery,
    isPending,
  } = useUpdateGallery(
    galleryId,
    form.setError
  );

  const onSubmit = async (
    values: UpdateGalleryValues
  ) => {
    try {
      await updateGallery(values);

      toast.success(
        "Gallery has been successfully updated."
      );
    } catch { return }
  };

  if (isLoading || !gallery) {
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
            sidebar={<GalleryInfoFields />}
            content={<GalleryPhotoPlug />}
            footer={
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  isPending
                }
                variant={form.formState.isValid ? 'default' : 'lightDisabled'}

                className="w-full lg:w-[250px]"
              >
                {isPending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            }
          />
        </form>
      </FormProvider>
    </>
  );
};