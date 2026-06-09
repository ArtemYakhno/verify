import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGalleryHeader } from "../useGalleryHeader";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { useRouteMatch } from "@/app/routes/hooks/useRouteMatch";


let mockId: string | undefined = "5";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: mockId }),
}));

vi.mock("@/common/hooks/useGalleryOwner");
vi.mock("@/app/routes/hooks/useRouteMatch");

vi.mock("../../components/ActionBtn", () => ({
  ActionBtn: ({ to, label }: { to: string; label: string }) => (
    <a href={to}>{label}</a>
  ),
}));

const mockUseGalleryOwner = vi.mocked(useGalleryOwner);
const mockUseRouteMatch = vi.mocked(useRouteMatch);

const NO_MATCH = {
  isGalleries: false,
  isCreateGallery: false,
  isUploadGallery: false,
  isEditGallery: false,
  isGalleryDetail: false,
};

function setupRoute(active: Partial<typeof NO_MATCH>) {
  mockUseRouteMatch.mockReturnValue({ ...NO_MATCH, ...active } as never);
}

function setupOwner(isOwner: boolean, gallery = { title: "My Gallery" }) {
  mockUseGalleryOwner.mockReturnValue({ isOwner, gallery } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockId = "5";
  setupOwner(false);
});

describe("useGalleryHeader", () => {
  it("returns null when no route matches", () => {
    setupRoute({});
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current).toBeNull();
  });

  it("returns correct title and action for Galleries route", () => {
    setupRoute({ isGalleries: true });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("List of galleries");
    expect(result.current?.action).toBeDefined();
  });

  it("returns correct title and action for CreateGallery route", () => {
    setupRoute({ isCreateGallery: true });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Create a new gallery");
    expect(result.current?.action).toBeDefined();
  });

  it("returns correct title and no action for UploadGallery route", () => {
    setupRoute({ isUploadGallery: true });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Upload photos");
    expect(result.current?.action).toBeUndefined();
  });

  it("returns title and action for EditGallery when owner", () => {
    setupRoute({ isEditGallery: true });
    setupOwner(true);
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Edit gallery");
    expect(result.current?.action).toBeDefined();
  });

  it("returns title and no action for EditGallery when not owner", () => {
    setupRoute({ isEditGallery: true });
    setupOwner(false);
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Edit gallery");
    expect(result.current?.action).toBeUndefined();
  });

  it("returns null for EditGallery when id is missing", () => {
    mockId = undefined;
    setupRoute({ isEditGallery: true });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current).toBeNull();
  });

  it("uses gallery.title for GalleryDetail when gallery is loaded", () => {
    setupRoute({ isGalleryDetail: true });
    setupOwner(false, { title: "Vacation Photos" });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Vacation Photos");
  });

  it("uses fallback title for GalleryDetail when gallery is null", () => {
    mockUseGalleryOwner.mockReturnValue({ isOwner: false, gallery: null } as never);
    setupRoute({ isGalleryDetail: true });
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.title).toBe("Gallery: #5");
  });

  it("returns action for GalleryDetail when owner", () => {
    setupRoute({ isGalleryDetail: true });
    setupOwner(true);
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.action).toBeDefined();
  });

  it("returns no action for GalleryDetail when not owner", () => {
    setupRoute({ isGalleryDetail: true });
    setupOwner(false);
    const { result } = renderHook(() => useGalleryHeader());
    expect(result.current?.action).toBeUndefined();
  });
});