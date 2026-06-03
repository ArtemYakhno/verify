import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Slider } from "@/common/components/ui/slider";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { GalleryFilterQuery } from "../../../types/gallery-filter-query";
import { GALLERY_IMAGES_COUNT_MAX, GALLERY_IMAGES_COUNT_MIN } from "@/common/constants/pagination.constants";
import { Separator } from "@/common/components/ui/separator";



interface GalleryFilterProps {
  filters: GalleryFilterQuery;
  onSetFilter: (filters: GalleryFilterQuery) => void;
  onResetFilter: () => void;
}

const MIN_CREATED_DATE = "2000-01-01";

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const today = formatDateForInput(new Date());

export const GalleryFilter = ({
  filters,
  onSetFilter,
  onResetFilter,
}: GalleryFilterProps) => {
  const [open, setOpen] = useState(false);

  const [createdFrom, setCreatedFrom] = useState(filters.createdFrom ?? "");
  const [createdTo, setCreatedTo] = useState(filters.createdTo ?? "");
  const [imageRange, setImageRange] = useState<[number, number]>([
    filters.minImages ?? GALLERY_IMAGES_COUNT_MIN,
    filters.maxImages ?? GALLERY_IMAGES_COUNT_MAX,
  ]);

  const handleOpen = () => {
    setCreatedFrom(filters.createdFrom ?? "");
    setCreatedTo(filters.createdTo ?? "");
    setImageRange([
      filters.minImages ?? GALLERY_IMAGES_COUNT_MIN,
      filters.maxImages ?? GALLERY_IMAGES_COUNT_MAX,
    ]);
    setOpen(true);
  };

  const handleApply = () => {
    onSetFilter({
      createdFrom: createdFrom || undefined,
      createdTo: createdTo || undefined,
      minImages: imageRange[0],
      maxImages: imageRange[1],
    });
    setOpen(false);
  };

  const handleReset = () => {
    setCreatedFrom("");
    setCreatedTo("");
    setImageRange([GALLERY_IMAGES_COUNT_MIN, GALLERY_IMAGES_COUNT_MAX]);
    onResetFilter();
  };

  const hasActiveFilters =
    !!filters.createdFrom ||
    !!filters.createdTo ||
    filters.minImages !== GALLERY_IMAGES_COUNT_MIN ||
    filters.maxImages !== GALLERY_IMAGES_COUNT_MAX;

  return (
    <>
      <div className="relative">
        <Button
          variant="transparent"
          size="auto"
          className="rounded-full bg-statuses h-[40px] w-[40px]"
          onClick={handleOpen}
          aria-label="Open filters"
        >
          <SlidersHorizontal className="text-ui-black" size={16} />
        </Button>

        {hasActiveFilters && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green" />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col lg:max-w-[460px]">
          <DialogTitle className="text-[24px] font-bold text-center text-ui-black">
            Filters
          </DialogTitle>

          <div className="flex flex-col gap-4 mt-4">

            <div className="flex flex-col gap-2">
              <p className="typo-main text-ui-black">
                Created date
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="filter-created-from"
                    className="typo-secondary text-placeholder"
                  >
                    From
                  </Label>
                  <Input
                    id="filter-created-from"
                    type="date"
                    value={createdFrom}
                    min={MIN_CREATED_DATE}
                    max={createdTo || today}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="filter-created-to"
                    className="typo-secondary text-placeholder"
                  >
                    To
                  </Label>
                  <Input
                    id="filter-created-to"
                    type="date"
                    value={createdTo}
                    min={createdFrom || MIN_CREATED_DATE}
                    max={today}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="typo-main text-ui-black">
                  Number of images
                </p>
                <span className="typo-secondary text-placeholder">
                  {GALLERY_IMAGES_COUNT_MIN} — {GALLERY_IMAGES_COUNT_MAX}
                </span>
              </div>
              <div>
                <Slider
                  min={GALLERY_IMAGES_COUNT_MIN}
                  max={GALLERY_IMAGES_COUNT_MAX}
                  step={1}
                  value={imageRange}
                  onValueChange={(value) =>
                    setImageRange(value as [number, number])
                  }
                  className="w-full"
                />

                <div className="flex justify-between mt-1.5">
                  <span className="typo-small text-placeholder">{imageRange[0]}</span>
                  <span className="typo-small text-placeholder">{imageRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-6.5">
            <Button
              className="w-full"
              onClick={handleApply}
            >
              Apply filters
            </Button>

            <Button
              variant="cancel"
              size="auto"
              className="w-fit"
              onClick={handleReset}
            >
              Reset filters
            </Button>
          </div>
        </DialogContent>
      </Dialog >
    </>
  );
};