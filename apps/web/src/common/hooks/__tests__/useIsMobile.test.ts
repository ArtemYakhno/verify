import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../useIsMobile";
import { BREAKPOINTS } from "../../constants/breakpoints.constants";

type ChangeHandler = () => void;

function createMediaQueryMock(matches: boolean) {
  const listeners: ChangeHandler[] = [];

  const mql = {
    matches,
    addEventListener: vi.fn((_: string, handler: ChangeHandler) => {
      listeners.push(handler);
    }),
    removeEventListener: vi.fn((_: string, handler: ChangeHandler) => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    }),
    trigger: (newMatches: boolean) => {
      mql.matches = newMatches;
      listeners.forEach((handler) => handler());
    },
  };

  return mql;
}

let currentMql: ReturnType<typeof createMediaQueryMock>;

beforeEach(() => {
  currentMql = createMediaQueryMock(false);

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn(() => currentMql),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  it("returns false when viewport is wider than breakpoint", () => {
    currentMql = createMediaQueryMock(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("returns true when viewport is narrower than breakpoint on mount", () => {
    currentMql = createMediaQueryMock(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("uses correct media query string for default breakpoint", () => {
    renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(max-width: ${BREAKPOINTS.MD - 1}px)`,
    );
  });

  it("uses correct media query string for default breakpoint", () => {
    renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith(
      `(max-width: ${BREAKPOINTS.MD - 1}px)`,
    );
  });

  it("updates to true when viewport shrinks below breakpoint", () => {
    currentMql = createMediaQueryMock(false);
    const { result } = renderHook(() => useIsMobile());

    act(() => currentMql.trigger(true));

    expect(result.current).toBe(true);
  });

  it("updates to false when viewport grows above breakpoint", () => {
    currentMql = createMediaQueryMock(true);
    const { result } = renderHook(() => useIsMobile());

    act(() => currentMql.trigger(false));

    expect(result.current).toBe(false);
  });

  it("re-subscribes when breakpoint prop changes", () => {
    const { rerender } = renderHook(({ bp }) => useIsMobile(bp), {
      initialProps: { bp: BREAKPOINTS.MD as number },
    });

    rerender({ bp: BREAKPOINTS.LG});

    expect(currentMql.removeEventListener).toHaveBeenCalled();
    expect(currentMql.addEventListener).toHaveBeenCalledTimes(2);
  });

  it("removes event listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(currentMql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
