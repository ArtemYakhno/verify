import { buildPath } from "@/app/routes/configs/root.config";
import { Button } from "@/common/components/ui/button";
import { Plug } from "@/common/components/ui/plug";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { extractErrorMessage } from "@/common/utils/erros/errors";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface GalleryDetailPlugProps {
  variant?: "empty" | "error";
  error?: unknown;
  galleryId?: number;
}

export const GalleryDetailPlug = ({
  variant = "empty",
  error,
  galleryId,
}: GalleryDetailPlugProps) => {
  const isError = variant === "error";
  const { isOwner } = useGalleryOwner({ fetchById: galleryId });

  const action = isError ? (
    <Button
      variant="secondary"
      className="group uppercase w-[250px] border-none"
      onClick={() => window.location.reload()}
    >
      Refresh page
      <RefreshCcw
        size={24}
        strokeWidth={1.5}
        className="text-accent-green group-hover:text-nature-white transition-colors"
      />
    </Button>
  ) : isOwner && galleryId ? (
    <Button asChild variant="secondary" className="group uppercase w-[250px] border-none">
      <Link to={buildPath.galleryUpload(galleryId)}>
        Go To Upload images
        <ArrowRight
          size={24}
          strokeWidth={1.5}
          className="text-accent-green group-hover:text-nature-white transition-colors"
        />
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Plug
        title={isError ? extractErrorMessage(error) : "List of images is empty"}
        description={
          isError
            ? "Failed to load images. Please try again later and contact support if the problem persists."
            : isOwner
              ? `You don't have any images. Please, click on the "Go To Upload Images" button.`
              : "This gallery has no images yet."
        }
        imageSrc={isError ? "/images/no-images.webp" : "/images/upload-images.webp"}
        imageAlt={isError ? "error" : "upload image"}
        imageClassName="lg:max-w-[311px]"
        className="lg:w-[434px]"
        action={action}
      />
    </div>
  );
};