import { Button } from "@/common/components/ui/button"
import { Plug } from "@/common/components/ui/plug"
import { extractErrorMessage } from "@/common/utils/errors"
import { RefreshCcw } from "lucide-react"


interface GalleryDetailPlugProps {
  error?: unknown;
}

export const GalleryDetailPlug = ({ error }: GalleryDetailPlugProps) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-10">
      <div className="min-h-full grid place-items-center">
        <Plug
          title={error ? extractErrorMessage(error) : "An unknown error occurred."}
          description="Failed to load galleries. Please, try refreshing the page or change id."
          imageSrc="/images/no-images.webp"
          imageAlt="error"
          imageClassName="lg:max-w-[311px]"
          className="w-full max-w-[434px]"
          action={
            <Button
              variant="secondary"
              className="group w-[250px] border-none uppercase"
              onClick={() => window.location.reload()}
            >
              Refresh page
              <RefreshCcw
                size={24}
                strokeWidth={1.5}
                className="text-accent-green transition-colors group-hover:text-nature-white"
              />
            </Button>
          }
        />
      </div>
    </div>
  );
};