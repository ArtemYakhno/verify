import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RoutePath } from "@/app/routes/configs/root.config";

import {
  createGallerySchema,
  type CreateGalleryValues,
} from "../schemas/gallery-dto.schema";

import { useCreateGallery } from "../gueries/gallery.mutations";

import { Button } from "@/common/components/ui/button";

import { GalleryFormHeader } from "../blocks/forms/GalleryFormHeader";
import { GalleryUploader } from "../blocks/forms/GalleryUploader";
import { GalleryInfoFields } from "../blocks/forms/GalleryInfoFields";
import { GalleryPhotoPlug } from "../blocks/forms/GalleryPhotoPlug";

import { GalleryFormContainer } from "../layouts/GalleryFormContainer";

import { toast } from "sonner";

export const GalleryCreateForm = () => {
  const navigate = useNavigate();

  const form = useForm<CreateGalleryValues>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      title: "",
      description: "",
    },
    mode: "onChange",
  });

  const {
    mutateAsync: createGallery,
    isPending,
  } = useCreateGallery(form.setError);

  const onSubmit = async (
    values: CreateGalleryValues
  ) => {
    try {
      await createGallery(values);

      toast.success(
        "A new gallery has been created in the gallery list."
      );

      navigate(RoutePath.Galleries);
    } catch { return }
  };

  return (
    <>
      <GalleryFormHeader
        title="Upload Photos"
        description="You can upload one photo or a set of photos."
      />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <GalleryFormContainer
            sidebar={
              <>
                <GalleryUploader />
                <GalleryInfoFields />
              </>
            }
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
                  ? "Creating..."
                  : "Create a new gallery"}
              </Button>
            }
          />
        </form>
      </FormProvider>
    </>
  );
};