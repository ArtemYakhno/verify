import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { GalleryFilter } from "../GalleryFilter";

vi.mock("@/common/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? children : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => children,
  DialogTitle: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/common/components/ui/slider", () => ({
  Slider: ({ onValueChange }: { onValueChange: (value: number[]) => void }) => (
    <button onClick={() => onValueChange([2, 5])}>
      mock-slider
    </button>
  ),
}));

describe("GalleryFilter", () => {
  const baseProps = {
    filters: {
      createdFrom: "",
      createdTo: "",
      minImages: undefined,
      maxImages: undefined,
    },
    onSetFilter: vi.fn(),
    onResetFilter: vi.fn(),
  };

  it("opens dialog and applies filters", () => {
    const onSetFilter = vi.fn();

    render(<GalleryFilter {...baseProps} onSetFilter={onSetFilter} />);

    fireEvent.click(screen.getByLabelText("Open filters"));

    const applyBtn = screen.getByText("Apply filters");
    fireEvent.click(applyBtn);

    expect(onSetFilter).toHaveBeenCalled();
  });

  it("resets filters correctly", () => {
    const onResetFilter = vi.fn();

    render(<GalleryFilter {...baseProps} onResetFilter={onResetFilter} />);

    fireEvent.click(screen.getByLabelText("Open filters"));

    fireEvent.click(screen.getByText("Reset filters"));

    expect(onResetFilter).toHaveBeenCalled();
  });

  it("sets correct payload on apply", () => {
    const onSetFilter = vi.fn();

    render(<GalleryFilter {...baseProps} onSetFilter={onSetFilter} />);

    fireEvent.click(screen.getByLabelText("Open filters"));

    fireEvent.click(screen.getByText("Apply filters"));

    expect(onSetFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        minImages: expect.any(Number),
        maxImages: expect.any(Number),
      })
    );
  });

  it("shows active filter indicator when filters exist", () => {
    render(
      <GalleryFilter
        {...baseProps}
        filters={{
          createdFrom: "2024-01-01",
          createdTo: "",
          minImages: 1,
          maxImages: 10,
        }}
      />
    );

    expect(screen.getByRole("button", { name: /open filters/i })).toBeInTheDocument();
  });
});