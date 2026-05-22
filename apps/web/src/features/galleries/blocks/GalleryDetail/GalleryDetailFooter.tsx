interface GalleryDetailFooterProps {
  count: number;
  onDeleteAll?: () => void;
}

export const GalleryDetailFooter = ({
  count,
  onDeleteAll,
}: GalleryDetailFooterProps) => {
  return (
    <div className="px-4 lg:px-7.5 mt-4 lg:mt-5">
      <button
        type="button"
        onClick={onDeleteAll}
        className="typo-cancel text-destructive"
      >
        Delete All ({count})
      </button>
    </div>
  );
};