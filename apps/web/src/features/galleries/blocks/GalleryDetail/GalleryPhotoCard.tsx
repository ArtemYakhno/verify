import { ArrowDownUp, Copy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ActionsMenu } from "@/common/components/blocks/ActionsMenu";
import { Button } from "@/common/components/ui/button";
import { ActionModal } from "@/app/modals/ActionModal";
import { openSuccessModal } from "@/common/stores/success-modal.store";
import { extractErrorMessage } from "@/common/utils/errors";

import type { Image } from "@/features/images/schemas/image-response.schema";
import {
  useCopyImage,
  useMoveImage,
  useSoftDeleteImage,
} from "@/features/images/gueries/images.mutations";

import { EditImageModal } from "../../modals/EditImageModal";
import { FormMyGalleriesSelect } from "../Form/FormMyGalleriesSelect";

interface GalleryPhotoCardProps {
  photo: Image;
}

export const GalleryPhotoCard = ({ photo }: GalleryPhotoCardProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [targetGalleryId, setTargetGalleryId] = useState<number | null>(null);

  const { mutateAsync: deleteImage, isPending: isDeleting } = useSoftDeleteImage();
  const { mutateAsync: moveImage, isPending: isMoving } = useMoveImage();
  const { mutateAsync: copyImage, isPending: isCopying } = useCopyImage();

  const resetTargetGallery = () => setTargetGalleryId(null);

  const handleCloseMove = () => {
    setMoveOpen(false);
    resetTargetGallery();
  };

  const handleCloseCopy = () => {
    setCopyOpen(false);
    resetTargetGallery();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteImage({
        galleryId: photo.galleryId,
        imageId: photo.id,
      });

      setDeleteOpen(false);

      openSuccessModal({
        description: "Photo has been successfully deleted.",
      });
    } catch (error) {
      extractErrorMessage(error);
    }
  };

  const handleConfirmMove = async () => {
    if (!targetGalleryId || targetGalleryId === photo.galleryId) return;

    try {
      await moveImage({
        galleryId: photo.galleryId,
        imageId: photo.id,
        body: {
          targetGalleryId,
        },
      });

      handleCloseMove();

      openSuccessModal({
        description: "Photo has been successfully moved.",
      });
    } catch (error) {
      extractErrorMessage(error);
    }
  };

  const handleConfirmCopy = async () => {
    if (!targetGalleryId || targetGalleryId === photo.galleryId) return;

    try {
      await copyImage({
        galleryId: photo.galleryId,
        imageId: photo.id,
        body: {
          targetGalleryId,
        },
      });

      handleCloseCopy();

      openSuccessModal({
        description: "Photo has been successfully copied.",
      });
    } catch (error) {
      extractErrorMessage(error);
    }
  };

  return (
    <div>
      <div className="relative mb-2 aspect-square lg:mb-2.5">
        <img
          src={photo.path}
          alt={photo.name || "Gallery photo"}
          className="h-full w-full rounded-md object-cover"
        />

        <div className="absolute -right-2 -top-2">
          <ActionsMenu
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={16} />,
                onClick: () => setEditOpen(true),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                onClick: () => setDeleteOpen(true),
              },
              {
                label: "Move",
                icon: <ArrowDownUp size={16} />,
                onClick: () => setMoveOpen(true),
              },
              {
                label: "Copy",
                icon: <Copy size={16} />,
                onClick: () => setCopyOpen(true),
              },
            ]}
          />
        </div>
      </div>

      {photo.name && (
        <p className="typo-secondary truncate leading-[150%] text-ui-black">
          {photo.name}
        </p>
      )}

      <p className="typo-third truncate leading-[150%] text-grey">
        {photo.comment || "No description yet"}
      </p>

      <ActionModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Image"
        description={<span>Are you sure you want to delete this photo?</span>}
        action={
          <Button
            variant="destructive"
            className="w-[250px]"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        }
      />

      <EditImageModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        galleryId={photo.galleryId}
        imageId={photo.id}
        initialName={photo.name}
        initialComment={photo.comment}
      />

      <ActionModal
        isOpen={moveOpen}
        onClose={handleCloseMove}
        title="Move to another gallery"
        description={
          <span>Please select the gallery to which you want to move this photo.</span>
        }
        action={
          <div className="w-full">
            <FormMyGalleriesSelect
              value={targetGalleryId}
              setTargetGalleryId={setTargetGalleryId}
              excludeGalleryId={photo.galleryId}
            />

            <Button
              variant="default"
              disabled={
                isMoving ||
                !targetGalleryId ||
                targetGalleryId === photo.galleryId
              }
              className="mt-4 w-[250px]"
              onClick={handleConfirmMove}
            >
              <ArrowDownUp size={18} />
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </div>
        }
      />

      <ActionModal
        isOpen={copyOpen}
        onClose={handleCloseCopy}
        title="Copy to another gallery"
        description={
          <span>Please select the gallery to which you want to copy this photo.</span>
        }
        action={
          <div className="w-full">
            <FormMyGalleriesSelect
              value={targetGalleryId}
              setTargetGalleryId={setTargetGalleryId}
              excludeGalleryId={photo.galleryId}
            />

            <Button
              variant="default"
              disabled={
                isCopying ||
                !targetGalleryId ||
                targetGalleryId === photo.galleryId
              }
              className="mt-4 w-[250px]"
              onClick={handleConfirmCopy}
            >
              <Copy size={18} />
              {isCopying ? "Copying..." : "Copy"}
            </Button>
          </div>
        }
      />
    </div>
  );
};