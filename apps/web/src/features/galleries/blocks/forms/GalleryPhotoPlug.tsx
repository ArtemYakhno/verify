import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Camera } from "lucide-react";




export const GalleryPhotoPlug = () => {
  const isMobile = useIsMobile();
  const count = isMobile ? 2 : 8;
  const slots = Array.from({ length: count });

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {slots.map((_, i) => {
          return (
            <div key={i} className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-md border-border border">
              <Camera size={32} className="text-border" />
              <span className="font-bold text-[12px] leading-[150%] tracking-[0%] text-border">Photo preview</span>
            </div>

          );
        })}
      </div>
      <p className="typo-main text-grey mt-4 lg:mt-7.5 text-center lg:text-left">
        Upload a maximum of{" "}
        <span className="font-bold">50 photos</span>, no more
        than <span className="font-bold">5MB</span> each.
      </p>
    </>

  );
};