import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBack } from "../useBack";
import { buildPath, RoutePath } from "@/app/routes/configs/root.config";
import { matchPath } from "react-router-dom";

const mockNavigate = vi.fn();
let mockLocation = { pathname: "/", state: null as unknown };

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  matchPath: vi.fn(),
}));

const mockMatchPath = vi.mocked(matchPath);

function getBack() {
  return renderHook(() => useBack()).result.current;
}

function setHistoryLength(length: number) {
  Object.defineProperty(window, "history", {
    writable: true,
    configurable: true,
    value: { length },
  });
}

function mockMatchForPath(matchedPath: string, params: Record<string, string> = {}) {
  mockMatchPath.mockImplementation((pattern) => {
    const path = typeof pattern === "string" ? pattern : pattern.path;
    return path === matchedPath ? ({ params } as never) : null;
  });
}

beforeEach(() => {
  mockLocation = { pathname: "/", state: null };
  setHistoryLength(2);
});

describe("useBack", () => {
  it("navigates to state.backTo when present", () => {
    mockLocation = { pathname: "/some/path", state: { backTo: "/custom-back" } };

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith("/custom-back");
  });

  it("ignores BACK_RULES when state.backTo is present", () => {
    mockLocation = {
      pathname: RoutePath.GalleryEdit,
      state: { backTo: "/custom-back" },
    };
    mockMatchForPath(RoutePath.GalleryEdit);

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith("/custom-back");
    expect(mockNavigate).not.toHaveBeenCalledWith(RoutePath.Galleries);
  });

  it("navigates to galleries from GalleryEdit path", () => {
    mockLocation = { pathname: RoutePath.GalleryEdit, state: null };
    mockMatchForPath(RoutePath.GalleryEdit);

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith(RoutePath.Galleries);
  });

  it("navigates to galleries from GalleryDetail path", () => {
    mockLocation = { pathname: RoutePath.GalleryDetail, state: null };
    mockMatchForPath(RoutePath.GalleryDetail);

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith(RoutePath.Galleries);
  });

  it("navigates to galleryEdit with correct id from GalleryUpload path", () => {
    mockLocation = { pathname: "/galleries/42/upload", state: null };
    mockMatchForPath(RoutePath.GalleryUpload, { id: "42" });

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith(buildPath.galleryEdit(42));
  });

  it("calls navigate(-1) when no rule matches and history.length > 1", () => {
    mockLocation = { pathname: "/unknown/path", state: null };
    mockMatchPath.mockReturnValue(null);
    setHistoryLength(2);

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates to Default route when no rule matches and history.length <= 1", () => {
    mockLocation = { pathname: "/unknown/path", state: null };
    mockMatchPath.mockReturnValue(null);
    setHistoryLength(1);

    getBack()();

    expect(mockNavigate).toHaveBeenCalledWith(RoutePath.Default, {
      replace: true,
    });
  });
});