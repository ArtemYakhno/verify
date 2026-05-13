import type { GalleryPhoto } from "@/common/types/GalleryPhoto";
import { GalleryPhotoCard } from "./GalleryPhotoCard";

interface GalleryPhotoListProps {
  photos: GalleryPhoto[];
}

export const GalleryPhotoList = ({ photos }: GalleryPhotoListProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:gap-5 lg:grid-cols-6">
      {photos.map((photo) => (
        <GalleryPhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
};