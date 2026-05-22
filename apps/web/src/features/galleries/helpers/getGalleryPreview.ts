const PREVIEW_LIMIT = 8;

export const getGalleryPreview = <T>(photos: T[]) => {
  if (photos.length <= PREVIEW_LIMIT) {
    return {
      items: photos,
    };
  }

  return {
    items: photos.slice(0, PREVIEW_LIMIT),
  };
};
