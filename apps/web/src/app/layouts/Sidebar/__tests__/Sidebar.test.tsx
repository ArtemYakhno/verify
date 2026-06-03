import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";
import { useLogout } from "@/features/auth/queries/auth.mutations";
import { useGetMe } from "@/features/profile/queries/profile.queries";

vi.mock("react-router-dom", () => ({
  NavLink: ({
    children,
    onClick,
  }: {
    children:
    | React.ReactNode
    | ((arg: { isActive: boolean }) => React.ReactNode);
    onClick?: () => void;
    to: string;
    className?: string | ((arg: { isActive: boolean }) => string);
  }) => (
    <a onClick={onClick}>
      {typeof children === "function"
        ? children({ isActive: false })
        : children}
    </a>
  ),
  useMatch: vi.fn(() => null),
}));

vi.mock("@/features/auth/queries/auth.mutations");
vi.mock("@/features/profile/queries/profile.queries");

vi.mock("@/assets/logo-text-hor.svg", () => ({ default: "logo.svg" }));

vi.mock("./NavItem", () => ({
  NavItem: ({ label, onClose }: { label: string; onClose?: () => void }) => (
    <a onClick={onClose}>{label}</a>
  ),
}));

vi.mock("@/common/components/ui/user-avatar", () => ({
  UserAvatar: ({ name }: { name: string }) => <div>{name}</div>,
}));

vi.mock("@/common/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/common/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

vi.mock("@/common/components/ui/separator", () => ({
  Separator: () => <hr />,
}));


const mockLogout = vi.fn();
const mockUseLogout = vi.mocked(useLogout);
const mockUseGetMe = vi.mocked(useGetMe);

const USER = {
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseLogout.mockReturnValue({ mutate: mockLogout, isPending: false } as never);
  mockUseGetMe.mockReturnValue({ data: USER } as never);
});

describe("Sidebar", () => {

  it("renders logo", () => {
    render(<Sidebar />);
    expect(screen.getByAltText("Verify logo")).toBeInTheDocument();
  });

  it("renders nav items", () => {
    render(<Sidebar />);
    expect(screen.getByText("List of galleries")).toBeInTheDocument();
    expect(screen.getByText("Search among galleries")).toBeInTheDocument();
    expect(screen.getByText("User management")).toBeInTheDocument();
  });

  it("renders user info when user is loaded", () => {
    render(<Sidebar />);
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render user section when user is null", () => {
    mockUseGetMe.mockReturnValue({ data: null } as never);
    render(<Sidebar />);
    expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    render(<Sidebar onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<Sidebar />);
    expect(screen.queryByRole("button", { name: "Close menu" })).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Sidebar onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Close menu" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls logout when Log Out button is clicked", async () => {
    render(<Sidebar />);

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("disables logout button when isPending", () => {
    mockUseLogout.mockReturnValue({ mutate: mockLogout, isPending: true } as never);
    render(<Sidebar />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
  });
});