import { GalleryPhotoCard } from "./GalleryPhotoCard";
import type { Image } from "@/features/images/schemas/image-response.schema";

interface GalleryPhotoListProps {
  photos: Image[];
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