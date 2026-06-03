import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import { GalleryInput } from "../GalleryInput";

describe("GalleryInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("calls onSetSearch with debounce", () => {
    const onSetSearch = vi.fn();

    render(<GalleryInput search="" onSetSearch={onSetSearch} />);

    fireEvent.change(screen.getByPlaceholderText("Search by title"), {
      target: { value: "cat" },
    });

    expect(onSetSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSetSearch).toHaveBeenCalledWith("cat");
  });

  it("updates input when external search changes", () => {
    const { rerender } = render(
      <GalleryInput search="initial" onSetSearch={vi.fn()} />
    );

    expect(screen.getByDisplayValue("initial")).toBeInTheDocument();

    rerender(<GalleryInput search="updated" onSetSearch={vi.fn()} />);

    expect(screen.getByDisplayValue("updated")).toBeInTheDocument();
  });

  it("resets debounce when typing again", () => {
    const onSetSearch = vi.fn();

    render(<GalleryInput search="" onSetSearch={onSetSearch} />);

    fireEvent.change(screen.getByPlaceholderText("Search by title"), {
      target: { value: "c" },
    });

    fireEvent.change(screen.getByPlaceholderText("Search by title"), {
      target: { value: "ca" },
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSetSearch).toHaveBeenCalledTimes(1);
    expect(onSetSearch).toHaveBeenCalledWith("ca");
  });
});