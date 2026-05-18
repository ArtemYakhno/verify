import { cn } from "@/common/lib/utils";
import { useRouteMatch } from "../routes/hooks/useRouteMatch";
import { Back } from "@/common/components/ui/back";
interface FooterProps {
  className?: string;
  textClassName?: string;
}

export const Footer = ({
  className,
  textClassName,
}: FooterProps) => {
  const { isGalleryDetail, isEditGallery, isUploadGallery } = useRouteMatch();
  const isBackVisible = isGalleryDetail || isEditGallery || isUploadGallery;
  return (
    <footer className={cn("w-full flex flex-col lg:items-center lg:justify-between gap-4 lg:flex-row mt-4 lg:mt-6", className)}>
      {isBackVisible && <div className="pl-4 lg:pl-0">
        <Back />
      </div>}
      <small className={cn("block w-full font-medium text-[14px] leading-[24px] text-ui-black",
        "text-center py-[54px] lg:py-0 lg:text-end bg-nature-white lg:bg-transparent",
        textClassName)}>
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </small>
    </footer>
  );
};