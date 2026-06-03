import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GallerySort } from "../GallerySort";
import type { ComponentProps } from "react";

type GallerySortProps = ComponentProps<typeof GallerySort>;

const defaultProps: GallerySortProps = {
  orderBy: "createdAt",
  orderDir: "desc",
  onSetSorting: vi.fn(),
};


const renderComponent = (props = defaultProps) => {
  return render(<GallerySort {...props} />);
};

describe("GallerySort", () => {
  it("renders default sorting value (desktop)", () => {
    renderComponent();

    expect(screen.getByText("Newest first")).toBeInTheDocument();
  });

  it("does not show active indicator dot for default sorting", () => {
    renderComponent();

    expect(screen.queryByTestId("active-sort-dot")).not.toBeInTheDocument();
  });

  it("calls onSetSorting when selecting desktop option", () => {
    const onSetSorting = vi.fn();

    render(
      <GallerySort
        orderBy="createdAt"
        orderDir="desc"
        onSetSorting={onSetSorting}
      />
    );

    const instance = screen.getByRole("combobox");

    fireEvent.click(instance);

    expect(onSetSorting).toBeDefined();
  });

  it("opens mobile dialog", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("selects sorting from mobile dialog and closes it", async () => {
    const user = userEvent.setup();
    const onSetSorting = vi.fn();

    renderComponent({
      ...defaultProps,
      onSetSorting,
    });

    await user.click(screen.getByRole("button"));

    const dialog = screen.getByRole("dialog");

    const option = within(dialog).getByText("Oldest first");
    await user.click(option);

    expect(onSetSorting).toHaveBeenCalledWith("createdAt", "asc");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows active item check icon in mobile dialog", async () => {
    const user = userEvent.setup();

    renderComponent({
      orderBy: "createdAt",
      orderDir: "desc",
      onSetSorting: vi.fn(),
    });

    await user.click(screen.getByRole("button"));

    const dialog = screen.getByRole("dialog");

    const activeItem = within(dialog).getByText("Title: A to Z");
    expect(activeItem).toBeInTheDocument();

    expect(
      within(dialog).getByText("Title: A to Z").parentElement
    ).toContainHTML("svg");
  });

  it("shows active sort indicator dot when sort is not default", () => {
    renderComponent({
      orderBy: "title",
      orderDir: "asc",
      onSetSorting: vi.fn(),
    });

    expect(screen.getByTestId("active-sort-dot")).toBeInTheDocument();
  });
});