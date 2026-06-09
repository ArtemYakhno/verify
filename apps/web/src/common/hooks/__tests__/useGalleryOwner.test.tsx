import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGalleryOwner } from "../useGalleryOwner";
import { useGetGalleryById } from "@/features/galleries/gueries/gallery.queries";
import { useGetMe } from "@/features/profile/queries/profile.queries";


let mockId: string | undefined = "1";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: mockId }),
}));

vi.mock("@/features/galleries/gueries/gallery.queries");
vi.mock("@/features/profile/queries/profile.queries");

const mockUseGetGalleryById = vi.mocked(useGetGalleryById);
const mockUseGetMe = vi.mocked(useGetMe);


const ME_USER = { id: 10, role: "USER" };
const ME_ADMIN = { id: 99, role: "ADMIN" };
const GALLERY = { id: 1, userId: 10 };
const OTHER_GALLERY = { id: 1, userId: 42 };


function setupMe(me: typeof ME_USER | null) {
  mockUseGetMe.mockReturnValue({ data: me } as never);
}

function setupGallery(
  gallery: typeof GALLERY | null,
  opts: { isError?: boolean; error?: Error | null } = {},
) {
  mockUseGetGalleryById.mockReturnValue({
    data: gallery,
    isError: opts.isError ?? false,
    error: opts.error ?? null,
  } as never);
}


beforeEach(() => {
  vi.clearAllMocks();
  mockId = "1";
});

describe("useGalleryOwner", () => {

  it("returns isOwner true when me.id matches gallery.userId", () => {
    setupMe(ME_USER);
    setupGallery(GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isOwner).toBe(true);
  });

  it("returns isOwner false when me.id does not match gallery.userId", () => {
    setupMe(ME_USER);
    setupGallery(OTHER_GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isOwner).toBe(false);
  });

  it("returns isOwner true for ADMIN regardless of gallery.userId", () => {
    setupMe(ME_ADMIN);
    setupGallery(OTHER_GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isOwner).toBe(true);
  });

  it("returns isOwner false when me is null", () => {
    setupMe(null);
    setupGallery(GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isOwner).toBe(false);
  });

  it("returns isOwner false when gallery is null", () => {
    setupMe(ME_USER);
    setupGallery(null);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isOwner).toBe(false);
  });

  it("returns isLoaded true when me and gallery are both loaded", () => {
    setupMe(ME_USER);
    setupGallery(GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isLoaded).toBe(true);
  });

  it("returns isLoaded false when me is not loaded", () => {
    setupMe(null);
    setupGallery(GALLERY);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isLoaded).toBe(false);
  });

  it("returns isLoaded false when gallery is not loaded", () => {
    setupMe(ME_USER);
    setupGallery(null);

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isLoaded).toBe(false);
  });

  it("uses options.userId as targetUserId when provided", () => {
    setupMe(ME_USER);
    setupGallery(null);

    const { result } = renderHook(() =>
      useGalleryOwner({ userId: ME_USER.id }),
    );

    expect(result.current.isOwner).toBe(true);
  });

  it("skips gallery fetch when options.userId is provided", () => {
    setupMe(ME_USER);
    setupGallery(null);

    renderHook(() => useGalleryOwner({ userId: ME_USER.id }));

    expect(mockUseGetGalleryById).toHaveBeenCalledWith(undefined);
  });

  it("returns isLoaded true when me and options.userId are both present", () => {
    setupMe(ME_USER);
    setupGallery(null);

    const { result } = renderHook(() =>
      useGalleryOwner({ userId: ME_USER.id }),
    );

    expect(result.current.isLoaded).toBe(true);
  });

  it("uses options.fetchById instead of id from useParams", () => {
    mockId = "999";
    setupMe(ME_USER);
    setupGallery(GALLERY);

    renderHook(() => useGalleryOwner({ fetchById: 1 }));

    expect(mockUseGetGalleryById).toHaveBeenCalledWith(1);
  });

  it("uses params id when fetchById is not provided", () => {
    mockId = "5";
    setupMe(ME_USER);
    setupGallery(GALLERY);

    renderHook(() => useGalleryOwner());

    expect(mockUseGetGalleryById).toHaveBeenCalledWith(5);
  });

  it("passes undefined to gallery query when params id is missing and no fetchById", () => {
    mockId = undefined;
    setupMe(ME_USER);
    setupGallery(null);

    renderHook(() => useGalleryOwner());

    expect(mockUseGetGalleryById).toHaveBeenCalledWith(undefined);
  });

  it("returns isError and error from gallery query", () => {
    const error = new Error("Not found");
    setupMe(ME_USER);
    setupGallery(null, { isError: true, error });

    const { result } = renderHook(() => useGalleryOwner());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});