

import { ActionModal } from "@/app/modals/ActionModal";
import { Button } from "@/common/components/ui/button";
import { Pagination } from "@/common/components/ui/pagination";
import { extractErrorMessage } from "@/common/utils/errors";
import { useSoftDeleteAllImages } from "@/features/images/gueries/images.mutations";
import { useState } from "react";
import { toast } from "sonner";
import type { Gallery } from "../../schemas/gallery-response.schema";
import { Trash2 } from "lucide-react";
import { openSuccessModal } from "@/common/stores/success-modal.store";

interface GalleryDetailFooterProps {
  page: number;
  perPage: number;
  meta: { total: number; totalPages: number };
  onPageChange: (page: number) => void;
  gallery: Gallery;
}

export const GalleryDetailFooter = ({ page, perPage, meta, onPageChange, gallery }: GalleryDetailFooterProps) => {
  const { mutateAsync: softDeleteAllImages, isPending: isDeleting } = useSoftDeleteAllImages();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleConfirmDeleteAll = async () => {
    try {
      await softDeleteAllImages({ galleryId: gallery.id });
      setDeleteOpen(false);
      openSuccessModal({
        description: "Photos have been successfully deleted from the gallery.",
      });
    }
    catch (error) {
      toast.error("Failed to delete all images. Please try again.");
      console.error("Error deleting all images:", extractErrorMessage(error));
    }
  }

  return (
    <>
      <div className="p-4  lg:p-5">
        <Button
          type="button"
          onClick={() => setDeleteOpen(true)}
          variant='transparent'
          className="typo-h3 text-green px-0 hover:text-accent-green"
          size='auto'
        >
          {isDeleting ? "Deleting..." : "Delete All"} ({meta.total})
        </Button>
        <div className="relative flex flex-col items-center justify-between gap-3  lg:flex-row mt-4 ">
          <span className="typo-small text-gray">
            <span className="font-semibold text-primary">{Math.min(page * perPage, meta.total)}</span>
            {" of "}
            <span className="font-semibold text-primary">{meta.total}</span>
            {" images"}
          </span>

          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
      <ActionModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete all images"
        description={<span>Are you sure you want to delete all images from <strong className="font-medium text-ui-black">{gallery.title}</strong> ?</span>}

        action={
          <Button variant="destructive" className="w-[250px]" onClick={handleConfirmDeleteAll} disabled={isDeleting}>
            <Trash2 size={18} />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        }
      />
    </>


  );
};