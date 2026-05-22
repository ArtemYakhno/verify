import { buildPath } from "@/app/routes/configs/root.config";
import { Button } from "@/common/components/ui/button"
import { Plug } from "@/common/components/ui/plug"
import { extractErrorMessage } from "@/common/utils/errors"
import { ArrowRight, RefreshCcw } from "lucide-react"
import { Link } from "react-router-dom";


interface GalleryDetailPlugProps {
  variant?: "empty" | "error";
  error?: unknown;
  galleryId?: number;
}

export const GalleryDetailPlug = ({ variant = "empty", error, galleryId }: GalleryDetailPlugProps) => {
  const isError = variant === "error";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-10">
      <div className="min-h-full grid place-items-center">
        <Plug
          title={isError ? extractErrorMessage(error) : "List of images is empty"}
          description={isError
            ? "Failed to load images. Please try again later and contact support if the problem persists."
            : `You don't have any images. Please, click on the "Go To Upload Images" button.`
          }
          imageSrc={isError ? "/images/no-images.webp" : "/images/upload-images.webp"}
          imageAlt={isError ? "error" : "upload image"}
          imageClassName="lg:max-w-[311px]"
          className="lg:w-[434px]"
          action={
            isError ? (
              <Button
                variant="secondary"
                className="group uppercase w-[250px] border-none"
                onClick={() => window.location.reload()}
              >
                Refresh page
                <RefreshCcw size={24} strokeWidth={1.5} className="text-accent-green group-hover:text-nature-white transition-colors" />
              </Button>
            ) : (
              <Button asChild variant="secondary" className="group uppercase w-[250px] border-none">
                <Link to={buildPath.galleryUpload(galleryId!)}>
                  Go To Upload images
                  <ArrowRight size={24} strokeWidth={1.5} className="text-accent-green group-hover:text-nature-white transition-colors" />
                </Link>
              </Button>
            )
          }
        />
      </div>
    </div>
  );
};



