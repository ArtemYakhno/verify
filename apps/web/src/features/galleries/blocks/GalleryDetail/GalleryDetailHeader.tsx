interface GalleryDetailHeaderProps {
  title: string;
  description?: string | null;
}

export const GalleryDetailHeader = ({
  title,
  description,
}: GalleryDetailHeaderProps) => {
  return (
    <>
      <h2 className="typo-h2  text-ui-black">{title}</h2>
      <p className="typo-main  text-placeholder mt-2">
        {description || "No description yet"}
      </p>
    </>
  );
};