import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionModal } from "../ActionModal";

// vi.mock("@/common/components/ui/dialog", () => ({
//   Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
//     open ? <div role="dialog">{children}</div> : null,
//   DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
//   DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
//   DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
// }));

vi.mock("@/common/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

const onClose = vi.fn();

beforeEach(() => vi.clearAllMocks());

describe("ActionModal", () => {
  it("does not show dialog content when closed", () => {
    render(
      <ActionModal
        isOpen={false}
        onClose={onClose}
        title="Delete"
        action={<button>Delete</button>}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title when open", () => {
    render(
      <ActionModal isOpen onClose={onClose} title="Delete gallery" action={<button>Delete</button>} />,
    );
    expect(screen.getByText("Delete gallery")).toBeInTheDocument();
  });

  it("renders action when open", () => {
    render(
      <ActionModal isOpen onClose={onClose} title="Delete" action={<button>Confirm delete</button>} />,
    );
    expect(screen.getByRole("button", { name: "Confirm delete" })).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <ActionModal
        isOpen
        onClose={onClose}
        title="Delete"
        description="This action cannot be undone"
        action={<button>Delete</button>}
      />,
    );
    expect(screen.getAllByText("This action cannot be undone").length).toBeGreaterThan(0);
  });

  it("does not render description when not provided", () => {
    render(
      <ActionModal isOpen onClose={onClose} title="Delete" action={<button>Delete</button>} />,
    );
    expect(screen.queryByText(/cannot be undone/)).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(
      <ActionModal isOpen onClose={onClose} title="Delete" action={<button>Delete</button>} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});