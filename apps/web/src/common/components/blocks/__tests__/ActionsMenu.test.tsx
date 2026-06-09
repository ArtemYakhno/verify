import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsMenu, type ActionItem } from "../ActionsMenu";

vi.mock("@/common/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/common/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) =>
    open ? (
      <div role="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/common/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  MoreVertical: () => <svg data-testid="more-icon" />,
}));

const makeActions = (): ActionItem[] => [
  {
    label: "Edit",
    icon: <span data-testid="edit-icon" />,
    onClick: vi.fn(),
  },
  {
    label: "Delete",
    icon: <span data-testid="delete-icon" />,
    onClick: vi.fn(),
    className: "text-red",
  },
];

beforeEach(() => vi.clearAllMocks());


describe("ActionsMenu", () => {
  it("renders all actions in dropdown", () => {
    const actions = makeActions();
    render(<ActionsMenu actions={actions} />);

    expect(screen.getAllByRole("button", { name: "Edit" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Delete" })[0]).toBeInTheDocument();
  });

  it("calls action.onClick when dropdown item is clicked", async () => {
    const actions = makeActions();
    render(<ActionsMenu actions={actions} />);

    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    expect(actions[0].onClick).toHaveBeenCalledOnce();
  });

  it("applies custom className to dropdown item", () => {
    const actions = makeActions();
    render(<ActionsMenu actions={actions} />);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons[0].className).toContain("text-red");
  });


  it("does not show dialog by default", () => {
    render(<ActionsMenu actions={makeActions()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens dialog when mobile trigger is clicked", async () => {
    const actions = makeActions();
    render(<ActionsMenu actions={actions} />);

    const triggers = screen.getAllByTestId("more-icon");
    await userEvent.click(triggers[triggers.length - 1].closest("button")!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders title in mobile dialog", async () => {
    render(<ActionsMenu actions={makeActions()} title="Gallery actions" />);

    const triggers = screen.getAllByTestId("more-icon");
    await userEvent.click(triggers[triggers.length - 1].closest("button")!);

    expect(screen.getByText("Gallery actions")).toBeInTheDocument();
  });

  it("renders default title when not provided", async () => {
    render(<ActionsMenu actions={makeActions()} />);

    const triggers = screen.getAllByTestId("more-icon");
    await userEvent.click(triggers[triggers.length - 1].closest("button")!);

    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("calls action.onClick and closes dialog when mobile action is clicked", async () => {
    const actions = makeActions();
    render(<ActionsMenu actions={actions} />);

    const triggers = screen.getAllByTestId("more-icon");
    await userEvent.click(triggers[triggers.length - 1].closest("button")!);

    await userEvent.click(screen.getByRole("dialog").querySelector("button[class*='w-full']")!);

    expect(actions[0].onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});