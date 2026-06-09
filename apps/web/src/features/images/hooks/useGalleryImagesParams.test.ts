import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGalleryImagesParams } from "./useGalleryImagesParams";
import {
  DEFAULT_IMAGE_ORDER_BY,
  DEFAULT_ORDER_DIR,
  DEFAULT_PAGE,
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

describe("useGalleryImagesParams", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockSetSearchParams.mockClear();
  });

  it("returns default params when search params are empty", () => {
    const { result } = renderHook(() => useGalleryImagesParams());

    expect(result.current.params.page).toBe(DEFAULT_PAGE);
    expect(result.current.params.perPage).toBe(12);
    expect(result.current.params.orderBy).toBe(DEFAULT_IMAGE_ORDER_BY);
    expect(result.current.params.orderDir).toBe(DEFAULT_ORDER_DIR);
  });

  it("parses valid search params from URL", () => {
    mockSearchParams = new URLSearchParams({
      page: "2",
      perPage: "24",
      orderBy: DEFAULT_IMAGE_ORDER_BY,
      orderDir: DEFAULT_ORDER_DIR,
    });

    const { result } = renderHook(() => useGalleryImagesParams());

    expect(result.current.params.page).toBe(2);
    expect(result.current.params.perPage).toBe(24);
  });

  it("falls back to defaults when search params are invalid", () => {
    mockSearchParams = new URLSearchParams({
      page: "invalid",
      orderBy: "nonexistent",
    });

    const { result } = renderHook(() => useGalleryImagesParams());

    expect(result.current.params.page).toBe(DEFAULT_PAGE);
    expect(result.current.params.orderBy).toBe(DEFAULT_IMAGE_ORDER_BY);
  });

  it("calls setSearchParams when setPage is called", () => {
    const { result } = renderHook(() => useGalleryImagesParams());

    act(() => {
      result.current.setPage(3);
    });

    expect(mockSetSearchParams).toHaveBeenCalledOnce();
  });

  it("passes correct page value to setSearchParams", () => {
    const { result } = renderHook(() => useGalleryImagesParams());

    act(() => {
      result.current.setPage(5);
    });

    const [callArg] = mockSetSearchParams.mock.calls[0];
    expect(callArg).toMatchObject({ page: 5 });
  });
});
