import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStaticHeaderConfig } from "../useStaticHeader";
import { STATIC_TITLES } from "../../configs/static.config";

let mockPathname = "/";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

describe("useStaticHeaderConfig", () => {
  it("returns null for unknown route", () => {
    mockPathname = "/unknown";
    const { result } = renderHook(() => useStaticHeaderConfig());
    expect(result.current).toBeNull();
  });

  it.each(Object.entries(STATIC_TITLES))(
    "returns correct title for %s",
    (path, title) => {
      mockPathname = path;
      const { result } = renderHook(() => useStaticHeaderConfig());
      expect(result.current).toEqual({ title });
    },
  );
});