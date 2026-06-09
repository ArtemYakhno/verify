import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrolled } from "../useScrolled";

beforeEach(() => {
  Object.defineProperty(window, "scrollY", {
    writable: true,
    configurable: true,
    value: 0,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    writable: true,
    configurable: true,
    value,
  });
}

function triggerScroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}


describe("useScrolled", () => {

  it("returns false when scrollY is 0", () => {
    setScrollY(0);
    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(false);
  });

  it("returns true immediately if page is already scrolled past threshold on mount", () => {
    setScrollY(100);
    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(true);
  });

  it("returns true when scrolled past default threshold (8px)", () => {
    const { result } = renderHook(() => useScrolled());

    setScrollY(9);
    triggerScroll();

    expect(result.current).toBe(true);
  });

  it("returns false when scrollY equals threshold (not strictly greater)", () => {
    const { result } = renderHook(() => useScrolled());

    setScrollY(8);
    triggerScroll();

    expect(result.current).toBe(false);
  });

  it("returns false when scrolled back above threshold", () => {
    const { result } = renderHook(() => useScrolled());

    setScrollY(50);
    triggerScroll();
    expect(result.current).toBe(true);

    setScrollY(4);
    triggerScroll();
    expect(result.current).toBe(false);
  });

  it("respects custom threshold", () => {
    const { result } = renderHook(() => useScrolled({ threshold: 50 }));

    setScrollY(50);
    triggerScroll();
    expect(result.current).toBe(false);

    setScrollY(51);
    triggerScroll();
    expect(result.current).toBe(true);
  });

  it("re-evaluates when threshold changes", () => {
    const { result, rerender } = renderHook(
      ({ threshold }) => useScrolled({ threshold }),
      { initialProps: { threshold: 10 } },
    );

    setScrollY(15);
    triggerScroll();
    expect(result.current).toBe(true);

    rerender({ threshold: 20 });
    expect(result.current).toBe(false);
  });

  it("removes scroll event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useScrolled());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});