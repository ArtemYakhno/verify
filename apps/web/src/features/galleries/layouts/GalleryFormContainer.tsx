import type { ReactNode } from "react";

type Props = {
  sidebar: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
};

export const GalleryFormContainer = ({
  sidebar,
  content,
  footer,
}: Props) => {
  return (
    <div className="flex flex-col flex-1 mt-4 lg:mt-10">
      <div className="flex flex-col lg:flex-row lg:gap-15 flex-1">
        <div className="flex flex-col gap-6 lg:gap-10 lg:w-[330px]">
          {sidebar}
        </div>

        <div className="flex flex-col flex-1 mt-4 lg:mt-0">
          {content}
        </div>
      </div>

      {footer && (
        <div className="mt-4 lg:mt-2 lg:self-end">
          {footer}
        </div>
      )}
    </div>
  );
};