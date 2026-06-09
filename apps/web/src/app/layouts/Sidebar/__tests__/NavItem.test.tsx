import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavItem } from "../NavItem";
import { Images } from "lucide-react";

let mockIsActive = false;

vi.mock("react-router-dom", () => ({
  NavLink: ({
    children,
    onClick,
    to,
  }: {
    children: (arg: { isActive: boolean }) => React.ReactNode;
    onClick?: () => void;
    to: string;
    end?: boolean;
    className?: string;
  }) => (
    <a href={to} onClick={onClick}>
      {children({ isActive: mockIsActive })}
    </a>
  ),
}));

beforeEach(() => {
  mockIsActive = false;
});

describe("NavItem", () => {
  it("renders label", () => {
    render(<NavItem to="/galleries" label="List of galleries" />);
    expect(screen.getByText("List of galleries")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<NavItem to="/galleries" label="Galleries" icon={Images} />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    render(<NavItem to="/galleries" label="Galleries" />);
    expect(document.querySelector("svg")).not.toBeInTheDocument();
  });

  it("calls onClose when clicked", async () => {
    const onClose = vi.fn();
    render(<NavItem to="/galleries" label="Galleries" onClose={onClose} />);

    await userEvent.click(screen.getByText("Galleries"));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("applies active styles when isActive is true", () => {
    mockIsActive = true;

    render(<NavItem to="/galleries" label="Active item" icon={Images} />);

    const label = screen.getByText("Active item");
    expect(label.className).toContain("text-ui-black");
    expect(label.className).toContain("font-medium");
  });

  it("applies inactive styles when isActive is false", () => {
    mockIsActive = false;

    render(<NavItem to="/galleries" label="Inactive item" />);

    const label = screen.getByText("Inactive item");
    expect(label.className).toContain("text-placeholder");
  });
});