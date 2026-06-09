import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryOwnerGuard } from "../GalleryOwnerGuard";
import { RoutePath } from "@/app/routes/configs/root.config";
import { useGalleryOwner } from "@/common/hooks/useGalleryOwner";
import { extractErrorMessage } from "@/common/utils/erros/errors";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("@/common/hooks/useGalleryOwner");
vi.mock("@/common/utils/erros/errors");

vi.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate" data-to={to} />
  ),
  Outlet: () => <div data-testid="outlet" />,
}));

const mockUseGalleryOwner = vi.mocked(useGalleryOwner);
const mockExtractErrorMessage = vi.mocked(extractErrorMessage);
const mockToastError = vi.mocked(toast.error);

type GalleryOwnerState = ReturnType<typeof useGalleryOwner>;

function setup(state: Partial<GalleryOwnerState>) {
  mockUseGalleryOwner.mockReturnValue({
    isLoaded: false,
    isOwner: false,
    isError: false,
    error: null,
    ...state,
  } as GalleryOwnerState);

  return render(<GalleryOwnerGuard />);
}


beforeEach(() => {
  vi.clearAllMocks();
  mockExtractErrorMessage.mockReturnValue("Something went wrong");
});

describe("GalleryOwnerGuard", () => {
  it("renders Outlet when user is owner", () => {
    setup({ isLoaded: true, isOwner: true, isError: false });

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("renders Outlet while still loading (not yet resolved)", () => {
    setup({ isLoaded: false, isOwner: false, isError: false });

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("redirects to Galleries when loaded and not owner", () => {
    setup({ isLoaded: true, isOwner: false, isError: false });

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      RoutePath.Galleries,
    );
  });

  it("redirects to Galleries when isError is true", () => {
    setup({ isLoaded: true, isOwner: false, isError: true, error: new Error("Forbidden") });

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      RoutePath.Galleries,
    );
  });

  it("shows default message when loaded and not owner", () => {
    setup({ isLoaded: true, isOwner: false, isError: false });

    expect(mockToastError).toHaveBeenCalledWith(
      "You don't have access to this page",
    );
  });

  it("shows extracted error message when isError is true", () => {
    const error = new Error("Forbidden");
    mockExtractErrorMessage.mockReturnValue("Forbidden");
    setup({ isLoaded: true, isOwner: false, isError: true, error });

    expect(mockExtractErrorMessage).toHaveBeenCalledWith(error);
    expect(mockToastError).toHaveBeenCalledWith("Forbidden");
  });

  it("does not show toast when user is owner", () => {
    setup({ isLoaded: true, isOwner: true, isError: false });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does not show toast while still loading", () => {
    setup({ isLoaded: false, isOwner: false, isError: false });

    expect(mockToastError).not.toHaveBeenCalled();
  });
});