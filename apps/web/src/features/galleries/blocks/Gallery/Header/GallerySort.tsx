import { useState } from "react";
import {
  ArrowUpDown,
  Check,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/common/components/ui/dialog";
import { cn } from "@/common/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  type OrderByGalleries,
  type OrderDir,
} from "@/common/constants/pagination.constants";

type SortingValue =
  | "createdAt-desc"
  | "createdAt-asc"
  | "title-asc"
  | "title-desc"
  | "imagesCount-desc"
  | "imagesCount-asc";

type SortingAction = {
  value: SortingValue;
  label: string;
  orderBy: OrderByGalleries;
  orderDir: OrderDir;
};

const SORTING_ACTIONS: readonly SortingAction[] = [
  {
    value: "createdAt-desc",
    label: "Newest first",
    orderBy: "createdAt",
    orderDir: 'desc',
  },
  {
    value: "createdAt-asc",
    label: "Oldest first",
    orderBy: "createdAt",
    orderDir: "asc",
  },
  {
    value: "title-asc",
    label: "Title: A to Z",
    orderBy: "title",
    orderDir: "asc",
  },
  {
    value: "title-desc",
    label: "Title: Z to A",
    orderBy: "title",
    orderDir: "desc",
  },
  {
    value: "imagesCount-desc",
    label: "Most images first",
    orderBy: "imagesCount",
    orderDir: "desc",
  },
  {
    value: "imagesCount-asc",
    label: "Fewest images first",
    orderBy: "imagesCount",
    orderDir: "asc",
  },
] as const;

interface GallerySortProps {
  orderBy: OrderByGalleries;
  orderDir: OrderDir;
  onSetSorting: (orderBy: OrderByGalleries, orderDir: OrderDir) => void;
}

export const GallerySort = ({
  orderBy,
  orderDir,
  onSetSorting,
}: GallerySortProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);


  const selectedSortValue =
    SORTING_ACTIONS.find(
      (action) =>
        action.orderBy === orderBy &&
        action.orderDir === orderDir,
    )?.value ?? "createdAt-desc"


  const hasActiveSort = selectedSortValue !== 'createdAt-desc'

  const handleSelectSorting = (sortingValue: SortingValue) => {
    const selectedAction = SORTING_ACTIONS.find(
      (action) => action.value === sortingValue,
    );

    if (!selectedAction) return;

    onSetSorting(selectedAction.orderBy, selectedAction.orderDir);
  };

  return (
    <>
      <div className="hidden lg:block">
        <Select value={selectedSortValue} onValueChange={handleSelectSorting}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" className="pb-10" />
          </SelectTrigger>

          <SelectContent position="popper" className="max-h-[250px]">
            <SelectGroup>
              {SORTING_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="lg:hidden">
        <div className="relative">
          <Button
            data-testid="mobile-sort-trigger"
            variant="transparent"
            size="auto"
            className="rounded-full bg-statuses h-[40px] w-[40px]"
            onClick={() => setMobileOpen(true)}
          >
            <ArrowUpDown className="text-ui-black" size={16} />
          </Button>
          {hasActiveSort && (
            <span data-testid="active-sort-dot" className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green" />
          )}
        </div>


        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent
            position="bottom"
            className="w-full max-w-none rounded-none rounded-t-lg p-0"
          >
            <DialogTitle className="bg-light-green px-6 py-5 typo-h3 font-medium text-ui-black rounded-t-md">
              Sort by
            </DialogTitle>

            <div className="grid gap-4 p-6">
              {SORTING_ACTIONS.map((action) => {
                const isActive = action.value === selectedSortValue;

                return (
                  <Button
                    key={action.value}
                    variant="transparent"
                    className={cn(
                      "h-9 w-full justify-start px-0 text-[16px] font-medium text-ui-black",
                      isActive && "text-primary",
                    )}
                    onClick={() => {
                      onSetSorting(action.orderBy, action.orderDir);
                      setMobileOpen(false);
                    }}
                  >
                    <div className="flex-1 flex justify-between">
                      {action.label}
                      {action.value === selectedSortValue && <Check className="text-green"></Check>}
                    </div>

                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};