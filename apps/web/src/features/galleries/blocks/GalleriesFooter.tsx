import { Pagination } from "@/common/components/ui/pagination";

interface GalleriesFooterProps {
  page: number;
  perPage: number;
  meta: { total: number; totalPages: number };
  onPageChange: (page: number) => void;
}



export const GalleriesFooter = ({ page, perPage, meta, onPageChange }: GalleriesFooterProps) => {
  return (
    <div className="relative flex flex-col items-center justify-between gap-3 py-5 lg:flex-row lg:p-5 ">
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