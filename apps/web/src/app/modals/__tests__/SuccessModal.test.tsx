import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuccessModal } from "../SuccessModal";

describe("SuccessModal", () => {
  it("renders nothing when closed", () => {
    render(<SuccessModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("success-modal")).not.toBeInTheDocument();
  });

  it("renders title when open", () => {
    render(<SuccessModal isOpen onClose={vi.fn()} title="Gallery created!" />);
    expect(screen.getByText("Gallery created!")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <SuccessModal isOpen onClose={vi.fn()} description="Your gallery is ready" />,
    );
    expect(screen.getAllByText("Your gallery is ready").length).toBeGreaterThan(0);
  });

  it("renders check icon", () => {
    render(<SuccessModal isOpen onClose={vi.fn()} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });
});