import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvalidIdGuard } from "../InvalidIdGuard";
import { RoutePath } from "@/app/routes/configs/root.config";

const mockNavigate = vi.fn();
let mockId: string | undefined = "1";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: mockId }),
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
    mockNavigate(to, replace);
    return <div data-testid="navigate" data-to={to} />;
  },
  Outlet: () => <div data-testid="outlet" />,
}));

function renderGuard() {
  return render(<InvalidIdGuard />);
}

function expectRedirect() {
  expect(screen.getByTestId("navigate")).toHaveAttribute(
    "data-to",
    RoutePath.NotFoundPage,
  );
  expect(mockNavigate).toHaveBeenCalledWith(RoutePath.NotFoundPage, true);
}

function expectOutlet() {
  expect(screen.getByTestId("outlet")).toBeInTheDocument();
}

describe("InvalidIdGuard", () => {
  it("renders Outlet for valid positive integer id", () => {
    mockId = "1";
    renderGuard();
    expectOutlet();
  });

  it("renders Outlet for large valid id", () => {
    mockId = "99999";
    renderGuard();
    expectOutlet();
  });

  it("redirects to NotFoundPage when id is undefined", () => {
    mockId = undefined;
    renderGuard();
    expectRedirect();
  });

  it("redirects to NotFoundPage when id is empty string", () => {
    mockId = "";
    renderGuard();
    expectRedirect();
  });

  it("redirects when id is non-numeric string", () => {
    mockId = "abc";
    renderGuard();
    expectRedirect();
  });

  it("redirects when id is alphanumeric", () => {
    mockId = "1a2b";
    renderGuard();
    expectRedirect();
  });

  it("redirects when id is 0", () => {
    mockId = "0";
    renderGuard();
    expectRedirect();
  });

  it("redirects when id is negative", () => {
    mockId = "-1";
    renderGuard();
    expectRedirect();
  });

  it("redirects when id is a float", () => {
    mockId = "1.5";
    renderGuard();
    expectRedirect();
  });
});