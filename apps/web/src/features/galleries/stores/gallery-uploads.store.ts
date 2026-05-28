import { create } from "zustand";

type GalleryUploadsStore = {
  previewUrls: Record<string, string>;
  ensurePreviews: (files: File[]) => void;
  getPreviewUrl: (file?: File) => string | undefined;
  removePreview: (file?: File) => void;
  clearPreviews: () => void;
};

const getFileKey = (file: File) =>
  `${file.name}_${file.size}_${file.lastModified}`;

export const useGalleryUploadsStore = create<GalleryUploadsStore>(
  (set, get) => ({
    previewUrls: {},

    ensurePreviews: (files) =>
      set((state) => {
        const next = { ...state.previewUrls };

        files.forEach((file) => {
          const key = getFileKey(file);
          if (!next[key]) {
            next[key] = URL.createObjectURL(file);
          }
        });

        return { previewUrls: next };
      }),

    getPreviewUrl: (file) => {
      if (!file) return undefined;
      return get().previewUrls[getFileKey(file)];
    },

    removePreview: (file) => {
      if (!file) return;

      const key = getFileKey(file);
      const current = get().previewUrls[key];

      if (current) {
        URL.revokeObjectURL(current);
      }

      set((state) => {
        const next = { ...state.previewUrls };
        delete next[key];
        return { previewUrls: next };
      });
    },

    clearPreviews: () => {
      Object.values(get().previewUrls).forEach((url) =>
        URL.revokeObjectURL(url),
      );
      set({ previewUrls: {} });
    },
  }),
);
