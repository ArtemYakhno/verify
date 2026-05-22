import { Pencil, Trash2 } from "lucide-react";
import { ActionsMenu } from "@/common/components/blocks/ActionsMenu";

interface GalleryPhotoCardProps {
  photo: {
    id: number;
    src: string;
    name?: string;
    comment?: string;
  };
}

export const GalleryPhotoCard = ({ photo }: GalleryPhotoCardProps) => {
  return (
    <div>
      <div className="relative aspect-square mb-2 lg:mb-2.5">
        <img
          src={photo.src}
          alt={photo.name || "Gallery photo"}
          className="w-full h-full rounded-md object-cover"
        />

        <div className="absolute -top-2 -right-2">
          <ActionsMenu
            actions={[
              { label: "Edit", icon: <Pencil size={16} />, onClick: () => { } },
              { label: "Delete", icon: <Trash2 size={16} />, onClick: () => { } },
            ]}
          />
        </div>
      </div>

      {photo.name && <p className="typo-secondary text-ui-black truncate leading-[150%]">
        {photo.name}
      </p>}

      <p className="typo-third text-grey truncate  leading-[150%]">
        {photo.comment || "No description yet"}
      </p>
    </div>
  );
};