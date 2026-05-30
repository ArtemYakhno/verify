import { Pagination } from "@/common/components/ui/pagination";

interface GalleryFooterProps {
  page: number;
  perPage: number;
  meta: { total: number; totalPages: number };
  onPageChange: (page: number) => void;
}



export const GalleryFooter = ({ page, perPage, meta, onPageChange }: GalleryFooterProps) => {
  return (
    <div className="relative flex flex-col items-center justify-between gap-3 lg:flex-row mt-4 lg:mt-5">
      <span className="typo-small text-gray">
        <span className="font-semibold text-primary">{Math.min(page * perPage, meta.total)}</span>
        {" of "}
        <span className="font-semibold text-primary">{meta.total}</span>
        {" galleries"}
      </span>

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};