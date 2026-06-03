import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHeaderConfigs } from "../useHeaderConfigs";
import { useStaticHeaderConfig } from "../useStaticHeader";
import { useGalleryHeader } from "../useGalleryHeader";

vi.mock("../useStaticHeader", () => ({
  useStaticHeaderConfig: vi.fn(),
}));

vi.mock("../useGalleryHeader", () => ({
  useGalleryHeader: vi.fn(),
}));

const mockStatic = vi.mocked(useStaticHeaderConfig);
const mockGallery = vi.mocked(useGalleryHeader);

describe("useHeaderConfigs", () => {
  it("returns static config when present", () => {
    mockStatic.mockReturnValue({ title: "Profile settings" });
    mockGallery.mockReturnValue({ title: "List of galleries" });

    const { result } = renderHook(() => useHeaderConfigs());

    expect(result.current.title).toBe("Profile settings");
  });

  it("returns gallery config when static is null", () => {
    mockStatic.mockReturnValue(null);
    mockGallery.mockReturnValue({ title: "List of galleries" });

    const { result } = renderHook(() => useHeaderConfigs());

    expect(result.current.title).toBe("List of galleries");
  });

  it("returns default title when both are null", () => {
    mockStatic.mockReturnValue(null);
    mockGallery.mockReturnValue(null);

    const { result } = renderHook(() => useHeaderConfigs());

    expect(result.current).toEqual({ title: "Verify" });
  });
});
