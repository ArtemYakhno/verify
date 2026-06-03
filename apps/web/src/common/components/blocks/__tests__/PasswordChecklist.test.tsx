import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordChecklist } from "../PasswordChecklist";

function getItem(label: string) {
  return screen.getByText(label).closest("li")!;
}

function expectValid(label: string) {
  const item = getItem(label);
  expect(item.querySelector("[data-testid='check-icon']")).toBeInTheDocument();
  expect(item.querySelector("[data-testid='x-icon']")).not.toBeInTheDocument();
  expect(screen.getByText(label).className).toContain("text-ui-black");
}

function expectInvalid(label: string) {
  const item = getItem(label);
  expect(item.querySelector("[data-testid='x-icon']")).toBeInTheDocument();
  expect(item.querySelector("[data-testid='check-icon']")).not.toBeInTheDocument();
  expect(screen.getByText(label).className).toContain("text-grey");
}

describe("PasswordChecklist", () => {

  it("validates minimum 8 characters", () => {
    render(<PasswordChecklist password="Abcdefg1" confirmPassword="" />);
    expectValid("Password has at least 8 characters.");
  });

  it("invalidates when shorter than 8 characters", () => {
    render(<PasswordChecklist password="Abc1" confirmPassword="" />);
    expectInvalid("Password has at least 8 characters.");
  });

  it("validates password has a number", () => {
    render(<PasswordChecklist password="Abcdefg1" confirmPassword="" />);
    expectValid("Password has a number.");
  });

  it("invalidates when no number", () => {
    render(<PasswordChecklist password="Abcdefgh" confirmPassword="" />);
    expectInvalid("Password has a number.");
  });

  it("validates password has an uppercase letter", () => {
    render(<PasswordChecklist password="Abcdefg1" confirmPassword="" />);
    expectValid("Password has an uppercase letter.");
  });

  it("invalidates when no uppercase letter", () => {
    render(<PasswordChecklist password="abcdefg1" confirmPassword="" />);
    expectInvalid("Password has an uppercase letter.");
  });

  it("validates password has a lowercase letter", () => {
    render(<PasswordChecklist password="Abcdefg1" confirmPassword="" />);
    expectValid("Password has a lowercase letter.");
  });

  it("invalidates when no lowercase letter", () => {
    render(<PasswordChecklist password="ABCDEFG1" confirmPassword="" />);
    expectInvalid("Password has a lowercase letter.");
  });

  it("validates when passwords match", () => {
    render(
      <PasswordChecklist password="Abcdefg1" confirmPassword="Abcdefg1" />,
    );
    expectValid("Passwords match.");
  });

  it("invalidates when passwords do not match", () => {
    render(
      <PasswordChecklist password="Abcdefg1" confirmPassword="Different1" />,
    );
    expectInvalid("Passwords match.");
  });

  it("invalidates when confirmPassword is empty", () => {
    render(<PasswordChecklist password="Abcdefg1" confirmPassword="" />);
    expectInvalid("Passwords match.");
  });

  it("shows all checks as valid for a strong matching password", () => {
    render(
      <PasswordChecklist password="Abcdefg1" confirmPassword="Abcdefg1" />,
    );

    expect(screen.getAllByTestId("check-icon")).toHaveLength(5);
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
  });

  it("shows all checks as invalid for empty password", () => {
    render(<PasswordChecklist password="" confirmPassword="" />);

    expect(screen.getAllByTestId("x-icon")).toHaveLength(5);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });
});