import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";
import { useRouteMatch } from "../../routes/hooks/useRouteMatch";

vi.mock("../../routes/hooks/useRouteMatch");
vi.mock("@/common/components/ui/back", () => ({
  Back: () => <button>Back</button>,
}));

const mockUseRouteMatch = vi.mocked(useRouteMatch);

const NO_MATCH = {
  isGalleryDetail: false,
  isEditGallery: false,
  isUploadGallery: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRouteMatch.mockReturnValue(NO_MATCH as never);
});


describe("Footer", () => {

  it("renders copyright with current year", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Verify. All Rights Reserved.`),
    ).toBeInTheDocument();
  });

  it("shows Back button on GalleryDetail route", () => {
    mockUseRouteMatch.mockReturnValue({ ...NO_MATCH, isGalleryDetail: true } as never);
    render(<Footer />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("shows Back button on EditGallery route", () => {
    mockUseRouteMatch.mockReturnValue({ ...NO_MATCH, isEditGallery: true } as never);
    render(<Footer />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("shows Back button on UploadGallery route", () => {
    mockUseRouteMatch.mockReturnValue({ ...NO_MATCH, isUploadGallery: true } as never);
    render(<Footer />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("hides Back button when no matching route", () => {
    render(<Footer />);
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("applies custom className to footer", () => {
    const { container } = render(<Footer className="custom-class" />);
    expect(container.querySelector("footer")).toHaveClass("custom-class");
  });

  it("applies custom textClassName to copyright text", () => {
    render(<Footer textClassName="custom-text" />);
    expect(
      screen.getByText(/Verify\. All Rights Reserved\./),
    ).toHaveClass("custom-text");
  });
});