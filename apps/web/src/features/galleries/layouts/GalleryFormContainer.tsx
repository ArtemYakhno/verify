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
    <div className="flex flex-col flex-1 min-h-0  mt-4 lg:mt-10">
      <div className="flex flex-col lg:flex-row lg:gap-15 flex-1 min-h-0">
        <aside className="flex flex-col gap-6 lg:w-[330px] lg:overflow-y-auto lg:pr-2">
          {sidebar}
        </aside>

        <main className="flex flex-col flex-1 lg:overflow-y-auto mt-6 lg:mt-0 lg:pr-2">
          {content}
        </main>
      </div>

      {footer && (
        <div className="mt-4 lg:mt-8 lg:self-end">
          {footer}
        </div>
      )}
    </div>
  );
};