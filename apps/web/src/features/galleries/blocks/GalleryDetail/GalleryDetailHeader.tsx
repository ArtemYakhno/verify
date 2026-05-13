interface GalleryDetailHeaderProps {
  title: string;
  description?: string | null;
}

export const GalleryDetailHeader = ({
  title,
  description,
}: GalleryDetailHeaderProps) => {
  return (
    <div className="px-4 lg:px-7.5">
      <h2 className="typo-h2 text-ui-black">{title}</h2>
      <p className="typo-main text-placeholder mt-1">
        {description || "No description yet"}
      </p>
    </div>
  );
};