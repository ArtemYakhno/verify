import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGalleriesParams } from "../useGalleriesParams";
import {
  DEFAULT_GALLERY_ORDER_BY,
  DEFAULT_ORDER_DIR,
  DEFAULT_PAGE,
  GALLERY_IMAGES_COUNT_MIN,
  GALLERY_IMAGES_COUNT_MAX,
} from "@/common/constants/pagination.constants";

const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

vi.mock("@/common/utils/search/searchHelper", () => ({
  searchParamsToObject: (params: URLSearchParams) =>
    Object.fromEntries(params.entries()),
  getSearchWith: (_: URLSearchParams, updates: Record<string, unknown>) =>
    updates,
  normalizeParam: (value: unknown, defaultValue: unknown) =>
    value ?? defaultValue,
}));

function getCallbackResult(searchParams = new URLSearchParams()) {
  const [callbackFn] = mockSetSearchParams.mock.calls[0];
  return typeof callbackFn === "function"
    ? callbackFn(searchParams)
    : callbackFn;
}

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
  mockSetSearchParams.mockClear();
});

describe("useGalleriesParams", () => {

  it("returns default params when search params are empty", () => {
    const { result } = renderHook(() => useGalleriesParams());

    expect(result.current.params.page).toBe(DEFAULT_PAGE);
    expect(result.current.params.perPage).toBe(12);
    expect(result.current.params.orderBy).toBe(DEFAULT_GALLERY_ORDER_BY);
    expect(result.current.params.orderDir).toBe(DEFAULT_ORDER_DIR);
  });

  it("parses valid search params from URL", () => {
    mockSearchParams = new URLSearchParams({
      page: "2",
      perPage: "24",
      orderBy: DEFAULT_GALLERY_ORDER_BY,
      orderDir: DEFAULT_ORDER_DIR,
      search: "cats",
    });

    const { result } = renderHook(() => useGalleriesParams());

    expect(result.current.params.page).toBe(2);
    expect(result.current.params.perPage).toBe(24);
    expect(result.current.params.search).toBe("cats");
  });

  it("falls back to defaults when search params are invalid", () => {
    mockSearchParams = new URLSearchParams({
      page: "invalid",
      orderBy: "nonexistent",
    });

    const { result } = renderHook(() => useGalleriesParams());

    expect(result.current.params.page).toBe(DEFAULT_PAGE);
    expect(result.current.params.orderBy).toBe(DEFAULT_GALLERY_ORDER_BY);
  });

  it("calls setSearchParams when setPage is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setPage(3);
    });

    expect(mockSetSearchParams).toHaveBeenCalledOnce();
  });

  it("passes correct page value when setPage is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setPage(5);
    });

    expect(getCallbackResult()).toMatchObject({ page: 5 });
  });

  it("calls setSearchParams when setPerPage is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setPerPage(24);
    });

    expect(mockSetSearchParams).toHaveBeenCalledOnce();
  });

  it("resets page when setPerPage is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setPerPage(24);
    });

    expect(getCallbackResult()).toMatchObject({ page: null });
  });

  it("passes correct search value when setSearch is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setSearch("landscape");
    });

    expect(getCallbackResult()).toMatchObject({ search: "landscape" });
  });

  it("resets page when setSearch is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setSearch("cats");
    });

    expect(getCallbackResult()).toMatchObject({ page: null });
  });

  it("passes correct orderBy and orderDir when setSorting is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setSorting("createdAt", "asc");
    });

    expect(getCallbackResult()).toMatchObject({
      orderBy: "createdAt",
      orderDir: "asc",
    });
  });

  it("resets page when setSorting is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setSorting("createdAt", "desc");
    });

    expect(getCallbackResult()).toMatchObject({ page: null });
  });

  it("passes correct filter values when setFilters is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setFilters({
        minImages: 2,
        maxImages: 10,
        createdFrom: "2024-01-01",
        createdTo: "2024-12-31",
      });
    });

    expect(getCallbackResult()).toMatchObject({
      minImages: 2,
      maxImages: 10,
      createdFrom: "2024-01-01",
      createdTo: "2024-12-31",
    });
  });

  it("resets page when setFilters is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.setFilters({ minImages: 1 });
    });

    expect(getCallbackResult()).toMatchObject({ page: null });
  });


  it("resets all filter fields when resetFilters is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.resetFilters();
    });

    expect(getCallbackResult()).toMatchObject({
      createdFrom: undefined,
      createdTo: undefined,
      minImages: GALLERY_IMAGES_COUNT_MIN,
      maxImages: GALLERY_IMAGES_COUNT_MAX,
    });
  });

  it("resets page when resetFilters is called", () => {
    const { result } = renderHook(() => useGalleriesParams());

    act(() => {
      result.current.resetFilters();
    });

    expect(getCallbackResult()).toMatchObject({ page: null });
  });
});
