import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <Button
        variant="transparent"
        size="auto"
        className={cn("p-1.5", page === 1 ? 'text-placeholder' : 'text-ui-black')}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={18} />
      </Button>

      {/* Pages */}
      {pages.map((pageIndex, i) =>
        pageIndex === "..." ? (
          <span key={`dots-${i}`} className="px-1 typo-small text-gray">
            ...
          </span>
        ) : (
          <Button
            key={pageIndex}
            variant="transparent"
            size="auto"
            onClick={() => onPageChange(pageIndex)}
            className={cn(
              "min-w-[32px] h-8 px-2 typo-main font-normal text-[14px] rounded-sm",
              page === pageIndex
                ? "bg-green text-nature-white"
                : "text-ui-black hover:bg-accent-green",
            )}
          >
            {pageIndex}
          </Button>
        ),
      )}

      {/* Next */}
      <Button
        variant="transparent"
        size="auto"
        className={cn("p-1.5", page === totalPages ? 'text-placeholder' : 'text-ui-black')}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
};