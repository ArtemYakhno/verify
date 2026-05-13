import { cn } from "@/common/lib/utils";
import type { ReactNode } from "react";

interface PlugProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  imageClassName?: string;
  action?: ReactNode;
  className?: string;
}

export const Plug = ({
  title,
  description,
  imageSrc,
  imageAlt = "",
  imageClassName = "",
  className = "",
  action,
}: PlugProps) => {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <h1 className="typo-h1 capitalize text-[24px]">{title}</h1>
      <p className="typo-main mt-2">{description}</p>

      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className={cn("mt-10 w-full h-[clamp(100px,16vw,200px)] lg:max-w-[511px] object-contain", imageClassName)}
      />

      {action && <div className="mt-10">{action}</div>}
    </div>
  );
};