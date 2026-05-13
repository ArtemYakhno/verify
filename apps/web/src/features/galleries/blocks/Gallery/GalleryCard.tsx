import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { buildPath, RoutePath } from "@/app/routes/configs/root.config";
import type { GalleryListItem } from "../../schemas/gallery-base.schema";
import { useDeleteGallery } from "../../gueries/gallery.mutations";
import { ActionModal } from "@/app/modals/ActionModal";
import { Button } from "@/common/components/ui/button";
import { openSuccessModal } from "@/common/stores/success-modal.store";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { ActionsMenu } from "@/common/components/blocks/ActionsMenu";
import { MOCK_PHOTOS } from "@/common/moks/gallery-detail.mock";
import { getGalleryPreview } from "../../helpers/getGalleryPreview";

interface GalleryCardProps {
  gallery: GalleryListItem;
}

export const GalleryCard = ({ gallery }: GalleryCardProps) => {
  const { isOwner } = useGalleryOwner({ userId: gallery.userId });
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutateAsync: deleteGallery, isPending } = useDeleteGallery();

  const photos = MOCK_PHOTOS
  const { items, moreCount } = getGalleryPreview(photos);

  const handleConfirmDelete = async () => {
    try {
      await deleteGallery(gallery.id)
      setDeleteOpen(false);
      openSuccessModal({
        title: "Gallery deleted",
        description: "Gallery has been successfully deleted.",
      });
    } catch {
      return;
    }
  };


  return (
    <div>
      <div className="relative aspect-square bg-light-green rounded-md p-5">
        {isOwner && (
          <div className="absolute -top-2 -right-2">
            <ActionsMenu
              actions={[
                { label: "Edit", icon: <Pencil size={16} />, onClick: () => navigate(buildPath.galleryEdit(gallery.id)) },
                { label: "Delete", icon: <Trash2 size={16} />, onClick: () => setDeleteOpen(true) },
              ]}
            />

          </div>
        )}

        <Link
          to={`${RoutePath.Galleries}/${gallery.id}`}
          className="block"
        >
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {items.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.src}
                  alt={gallery.title}
                  className="h-full w-full object-cover rounded-sm"
                />
              ))}

              {moreCount > 0 && (
                <div className="flex aspect-square items-center justify-center rounded-sm bg-transparent typo-secondary text-[12px]">
                  + more
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img src="/images/no-images.webp" alt="no images" />
            </div>
          )}
        </Link>
      </div>

      <h3 className="mt-2.5 typo-h3 truncate text-ui-black">{gallery.title}</h3>
      <p className="typo-main pb-1 text-[14px] truncate leading-[18px]">
        {gallery.description || 'No description yet'}
      </p>

      <ActionModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete gallery"
        description={<span>Are you sure you want to delete <strong className="font-medium text-ui-black">{gallery.title}</strong> ?</span>}

        action={
          <Button variant="destructive" className="w-[250px]" onClick={handleConfirmDelete} disabled={isPending}>
            <Trash2 size={18} />
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        }
      />
    </div>
  );
};