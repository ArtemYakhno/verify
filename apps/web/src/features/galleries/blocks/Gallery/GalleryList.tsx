import type { GalleryListItem } from "../../schemas/gallery-base.schema";
import { GalleryCard } from "./GalleryCard";

interface GalleryListProps {
  galleries: GalleryListItem[];
}

export const GalleryList = ({ galleries }: GalleryListProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {galleries.map((gallery) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
        />
      ))}
    </div>
  );
};