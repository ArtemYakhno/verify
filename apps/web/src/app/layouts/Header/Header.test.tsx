import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import { useHeaderConfigs } from "./hooks/useHeaderConfigs";

vi.mock("./hooks/useHeaderConfigs");

const mockUseHeaderConfigs = vi.mocked(useHeaderConfigs);

describe("Header", () => {
  it("renders title from useHeaderConfigs", () => {
    mockUseHeaderConfigs.mockReturnValue({ title: "Profile settings" });
    render(<Header onMenuClick={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Profile settings" })).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    mockUseHeaderConfigs.mockReturnValue({
      title: "Galleries",
      action: <button>Create</button>,
    });
    render(<Header onMenuClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    mockUseHeaderConfigs.mockReturnValue({ title: "Galleries" });
    render(<Header onMenuClick={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
  });

  it("calls onMenuClick when menu button is clicked", async () => {
    mockUseHeaderConfigs.mockReturnValue({ title: "Galleries" });
    const onMenuClick = vi.fn();
    render(<Header onMenuClick={onMenuClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onMenuClick).toHaveBeenCalledOnce();
  });
});