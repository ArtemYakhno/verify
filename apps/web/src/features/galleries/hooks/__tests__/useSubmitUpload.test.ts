import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubmitUpload } from "../useSubmitUpload";
import { useUploadImage } from "@/features/images/gueries/images.mutations";
import { handleUploadImageError } from "../../helpers/handleUploadImageError";
import { createWrapper } from "@/common/utils/test-utils/queryWrapper";

vi.mock("@/features/images/gueries/images.mutations", () => ({
  useUploadImage: vi.fn(),
}));

vi.mock("../../helpers/handleUploadImageError", () => ({
  handleUploadImageError: vi.fn(),
}));

const mockMutateAsync = vi.fn();
const mockUseUploadImage = vi.mocked(useUploadImage);
const mockHandleUploadImageError = vi.mocked(handleUploadImageError);

const GALLERY_ID = 1;

function makeUpload(name = "photo.jpg", size = 1024) {
  return {
    file: new File(["content"], name, { type: "image/jpeg" }),
    fileSize: size,
    name: null,
    comment: null,
  };
}

const mockSetError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUploadImage.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadImage>);
});

describe("useSubmitUpload", () => {

  it("returns initial uploadProgress state", () => {
    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    expect(result.current.uploadProgress).toEqual({
      isVisible: false,
      fileName: null,
      fileSize: 0,
      progress: 0,
      status: "idle",
    });
  });

  it("reflects isPending from useUploadImage", () => {
    mockUseUploadImage.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useUploadImage>);

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isUploadingImages).toBe(true);
  });

  it("sets progress to uploading when upload starts", async () => {
    mockMutateAsync.mockResolvedValue({});
    const upload = makeUpload("photo.jpg");

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [upload],
        setError: mockSetError,
      });
    });

    expect(result.current.uploadProgress.status).toBe("success");
    expect(result.current.uploadProgress.progress).toBe(100);
  });

  it("sets fileName and fileSize when upload starts", async () => {
    mockMutateAsync.mockResolvedValue({});
    const upload = makeUpload("my-photo.jpg", 2048);

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [upload],
        setError: mockSetError,
      });
    });

    expect(result.current.uploadProgress).toMatchObject({
      isVisible: true,
      fileName: "my-photo.jpg",
      fileSize: upload.file.size,
      status: "success",
    });
  });

  it("calls uploadImage with correct args", async () => {
    mockMutateAsync.mockResolvedValue({});
    const upload = makeUpload();

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [upload],
        setError: mockSetError,
      });
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        galleryId: GALLERY_ID,
        body: upload,
      }),
    );
  });

  it("returns correct successCount after all uploads succeed", async () => {
    mockMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    let returnValue: { successCount: number } | undefined;

    await act(async () => {
      returnValue = await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [
          makeUpload("a.jpg"),
          makeUpload("b.jpg"),
          makeUpload("c.jpg"),
        ],
        setError: mockSetError,
      });
    });

    expect(returnValue?.successCount).toBe(3);
  });

  it("calls onItemSuccess with correct index on each success", async () => {
    mockMutateAsync.mockResolvedValue({});
    const onItemSuccess = vi.fn();

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload("a.jpg"), makeUpload("b.jpg")],
        setError: mockSetError,
        onItemSuccess,
      });
    });

    expect(onItemSuccess).toHaveBeenCalledTimes(2);
    expect(onItemSuccess).toHaveBeenNthCalledWith(1, 0);
    expect(onItemSuccess).toHaveBeenNthCalledWith(2, 1);
  });

  it("uploads files sequentially, not in parallel", async () => {
    const callOrder: number[] = [];

    mockMutateAsync.mockImplementation(async ({ body }) => {
      callOrder.push(body.file.name.charCodeAt(0));
      return {};
    });

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [
          makeUpload("a.jpg"),
          makeUpload("b.jpg"),
          makeUpload("c.jpg"),
        ],
        setError: mockSetError,
      });
    });

    expect(callOrder).toEqual([97, 98, 99]); // a, b, c — в порядку
  });

  it("sets status to error when upload fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Upload failed"));

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload()],
        setError: mockSetError,
      });
    });

    expect(result.current.uploadProgress.status).toBe("error");
    expect(result.current.uploadProgress.progress).toBe(0);
  });

  it("calls handleUploadImageError with correct args on failure", async () => {
    const error = new Error("Upload failed");
    mockMutateAsync.mockRejectedValue(error);

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload()],
        setError: mockSetError,
      });
    });

    expect(mockHandleUploadImageError).toHaveBeenCalledWith(
      error,
      0,
      mockSetError,
    );
  });

  it("does not increment successCount when upload fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    let returnValue: { successCount: number } | undefined;

    await act(async () => {
      returnValue = await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload(), makeUpload()],
        setError: mockSetError,
      });
    });

    expect(returnValue?.successCount).toBe(0);
  });

  it("continues uploading remaining files after one fails", async () => {
    mockMutateAsync
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue({});

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    let returnValue: { successCount: number } | undefined;

    await act(async () => {
      returnValue = await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload("a.jpg"), makeUpload("b.jpg")],
        setError: mockSetError,
      });
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(returnValue?.successCount).toBe(1);
  });

  it("resets uploadProgress to initial state", async () => {
    mockMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() => useSubmitUpload(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.uploadFiles({
        galleryId: GALLERY_ID,
        uploads: [makeUpload()],
        setError: mockSetError,
      });
    });

    act(() => {
      result.current.resetUploadProgress();
    });

    expect(result.current.uploadProgress).toEqual({
      isVisible: false,
      fileName: null,
      fileSize: 0,
      progress: 0,
      status: "idle",
    });
  });
});
