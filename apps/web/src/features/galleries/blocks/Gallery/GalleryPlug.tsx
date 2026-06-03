import { RoutePath } from "@/app/routes/configs/root.config"
import { Button } from "@/common/components/ui/button"
import { Plug } from "@/common/components/ui/plug"
import { extractErrorMessage } from "@/common/utils/erros/errors"
import { ArrowRight, RefreshCcw } from "lucide-react"
import { Link } from "react-router-dom"
interface GalleryPlugProps {
  variant?: "empty" | "error";
  error?: unknown;
}

export const GalleryPlug = ({ variant = "empty", error }: GalleryPlugProps) => {
  const isError = variant === "error";

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Plug
        title={isError ? extractErrorMessage(error) : "List of galleries is empty"}
        description={isError
          ? "Failed to load galleries. Please try again later and contact support if the problem persists."
          : `You don't have any galleries. Please, click on the "Create a new gallery".`
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
              <Link to={RoutePath.GalleryCreate}>
                Create a new gallery
                <ArrowRight size={24} strokeWidth={1.5} className="text-accent-green group-hover:text-nature-white transition-colors" />
              </Link>
            </Button>
          )
        }
      />

    </div>
  );
};
