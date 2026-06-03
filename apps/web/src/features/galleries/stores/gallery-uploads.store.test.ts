import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGalleryUploadsStore } from "./gallery-uploads.store";

const mockCreateObjectURL = vi
  .spyOn(URL, "createObjectURL")
  .mockImplementation((file) => `blob:mock/${(file as File).name}`);

const mockRevokeObjectURL = vi
  .spyOn(URL, "revokeObjectURL")
  .mockImplementation(() => {});


const makeFile = (name: string, size = 100, lastModified = 1000): File =>
  Object.defineProperties(new File([], name), {
    size: { value: size },
    lastModified: { value: lastModified },
  });

const getFileKey = (file: File) =>
  `${file.name}_${file.size}_${file.lastModified}`;


beforeEach(() => {
  useGalleryUploadsStore.setState({ previewUrls: {} });
  vi.clearAllMocks();
});


describe("ensurePreviews", () => {
  it("creates a preview URL for each file", () => {
    const file = makeFile("photo.jpg");
    useGalleryUploadsStore.getState().ensurePreviews([file]);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(previewUrls[getFileKey(file)]).toBe("blob:mock/photo.jpg");
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
  });

  it("creates preview URLs for multiple files", () => {
    const fileA = makeFile("a.jpg", 100);
    const fileB = makeFile("b.jpg", 200);
    useGalleryUploadsStore.getState().ensurePreviews([fileA, fileB]);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(Object.keys(previewUrls)).toHaveLength(2);
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
  });

  it("does NOT overwrite an existing preview URL (idempotent)", () => {
    const file = makeFile("photo.jpg");
    useGalleryUploadsStore.getState().ensurePreviews([file]);
    useGalleryUploadsStore.getState().ensurePreviews([file]);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
  });

  it("does nothing when given an empty array", () => {
    useGalleryUploadsStore.getState().ensurePreviews([]);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(Object.keys(previewUrls)).toHaveLength(0);
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it("uses name + size + lastModified as the unique key", () => {
    const fileA = makeFile("photo.jpg", 100, 1000);
    const fileB = makeFile("photo.jpg", 999, 1000); // same name, different size
    useGalleryUploadsStore.getState().ensurePreviews([fileA, fileB]);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(Object.keys(previewUrls)).toHaveLength(2);
  });
});

describe("getPreviewUrl", () => {
  it("returns the preview URL for a known file", () => {
    const file = makeFile("photo.jpg");
    useGalleryUploadsStore.getState().ensurePreviews([file]);

    const url = useGalleryUploadsStore.getState().getPreviewUrl(file);
    expect(url).toBe("blob:mock/photo.jpg");
  });

  it("returns undefined when file is undefined", () => {
    const url = useGalleryUploadsStore.getState().getPreviewUrl(undefined);
    expect(url).toBeUndefined();
  });

  it("returns undefined for an unknown file", () => {
    const url = useGalleryUploadsStore
      .getState()
      .getPreviewUrl(makeFile("unknown.jpg"));
    expect(url).toBeUndefined();
  });
});

describe("removePreview", () => {
  it("removes the file from previewUrls", () => {
    const file = makeFile("photo.jpg");
    useGalleryUploadsStore.getState().ensurePreviews([file]);
    useGalleryUploadsStore.getState().removePreview(file);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(previewUrls[getFileKey(file)]).toBeUndefined();
  });

  it("calls URL.revokeObjectURL with the correct URL", () => {
    const file = makeFile("photo.jpg");
    useGalleryUploadsStore.getState().ensurePreviews([file]);
    useGalleryUploadsStore.getState().removePreview(file);

    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock/photo.jpg");
  });

  it("does nothing when file is undefined", () => {
    useGalleryUploadsStore.getState().removePreview(undefined);

    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
  });

  it("does NOT call revokeObjectURL for a file that was never added", () => {
    useGalleryUploadsStore.getState().removePreview(makeFile("ghost.jpg"));

    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
  });

  it("only removes the target file, leaving others intact", () => {
    const fileA = makeFile("a.jpg", 100);
    const fileB = makeFile("b.jpg", 200);
    useGalleryUploadsStore.getState().ensurePreviews([fileA, fileB]);
    useGalleryUploadsStore.getState().removePreview(fileA);

    const { previewUrls } = useGalleryUploadsStore.getState();
    expect(previewUrls[getFileKey(fileA)]).toBeUndefined();
    expect(previewUrls[getFileKey(fileB)]).toBe("blob:mock/b.jpg");
  });
});

describe("clearPreviews", () => {
  it("removes all entries from previewUrls", () => {
    const fileA = makeFile("a.jpg", 100);
    const fileB = makeFile("b.jpg", 200);
    useGalleryUploadsStore.getState().ensurePreviews([fileA, fileB]);
    useGalleryUploadsStore.getState().clearPreviews();

    expect(useGalleryUploadsStore.getState().previewUrls).toEqual({});
  });

  it("calls revokeObjectURL for every existing preview", () => {
    const fileA = makeFile("a.jpg", 100);
    const fileB = makeFile("b.jpg", 200);
    useGalleryUploadsStore.getState().ensurePreviews([fileA, fileB]);
    useGalleryUploadsStore.getState().clearPreviews();

    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock/a.jpg");
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock/b.jpg");
  });

  it("does nothing when store is already empty", () => {
    useGalleryUploadsStore.getState().clearPreviews();

    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
  });
});
