import { useGetGalleryById } from "@/features/galleries/gueries/gallery.queries";
import { useGetMe } from "@/features/profile/queries/profile.queries";
import { useParams } from "react-router-dom";


interface Options {
  userId?: number;
  fetchById?: number;
}

export const useGalleryOwner = (options: Options = {}) => {
  const { id } = useParams();
  const numericId = options.fetchById ?? (id ? Number(id) : undefined);

  const { data: me } = useGetMe();
  const { data: gallery, isError, error } = useGetGalleryById(
    options.userId ? undefined : numericId
  );

  const targetUserId = options.userId ?? gallery?.userId;

  return {
    isOwner: !!me && !!targetUserId && me.id === targetUserId,
    isLoaded: !!me && (!!options.userId || !!gallery),
    isError,
    error,
    gallery,
    me,
  };
};