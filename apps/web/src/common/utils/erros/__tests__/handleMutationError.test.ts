import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleMutationError } from "../handleMutationError";
import { extractErrorMessage, extractFieldErrors } from "../errors";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(() => "Something went wrong") },
}));

vi.mock("../errors", () => ({
  extractErrorMessage: vi.fn(),
  extractFieldErrors: vi.fn(),
}));

const mockExtractErrorMessage = vi.mocked(extractErrorMessage);
const mockExtractFieldErrors = vi.mocked(extractFieldErrors);
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockToastError.mockReset();
  mockExtractErrorMessage.mockReturnValue("Something went wrong");
  mockExtractFieldErrors.mockReturnValue({});
});

describe("handleMutationError", () => {
  it("shows toast when no field errors", () => {
    mockExtractFieldErrors.mockReturnValue({});

    handleMutationError(new Error("fail"));

    expect(mockToastError).toHaveBeenCalledWith("Something went wrong");
  });

  it("calls setError for mapped backend fields", () => {
    mockExtractFieldErrors.mockReturnValue({
      email: "Invalid email",
    });

    const setError = vi.fn();
    handleMutationError(new Error(), setError, { email: "email" });

    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "Invalid email",
    });
  });

  it("does not show toast when all field errors are mapped", () => {
    mockExtractFieldErrors.mockReturnValue({
      email: "Invalid email",
    });

    const setError = vi.fn();
    handleMutationError(new Error(), setError, { email: "email" });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows toast for unmapped backend fields", () => {
    mockExtractFieldErrors.mockReturnValue({
      email: "Invalid email",
      username: "Invalid username",
    });

    const setError = vi.fn();
    handleMutationError(new Error(), setError, { email: "email" });

    expect(mockToastError).toHaveBeenCalled();
  });

  it("skips setError for fields not in fieldMap", () => {
    mockExtractFieldErrors.mockReturnValue({
      username: "Invalid username",
    });

    const setError = vi.fn();
    handleMutationError(new Error(), setError, { email: "email" });

    expect(setError).not.toHaveBeenCalled();
  });

  it("shows toast when setError is not provided", () => {
    mockExtractFieldErrors.mockReturnValue({
      email: "Invalid email",
    });

    handleMutationError(new Error());

    expect(mockToastError).toHaveBeenCalled();
  });

  it("shows toast when fieldMap is not provided", () => {
    mockExtractFieldErrors.mockReturnValue({
      email: "Invalid email",
    });

    const setError = vi.fn();
    handleMutationError(new Error(), setError);

    expect(setError).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalled();
  });
});
