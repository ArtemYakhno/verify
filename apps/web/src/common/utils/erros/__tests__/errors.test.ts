import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { ApiValidationError, extractErrorMessage, extractFieldErrors } from "../errors";


function makeAxiosError(data?: object, hasResponse = true) {
  return {
    response: hasResponse ? { data } : undefined,
  };
}

describe("extractErrorMessage", () => {
  it("returns 'Server returned unexpected data' for ApiValidationError", () => {
    const zodError = new ZodError([]);
    const error = new ApiValidationError("zod fail", zodError);

    expect(extractErrorMessage(error)).toBe("Server returned unexpected data");
  });

  it("returns 'No server connection' when no response", () => {
    const error = makeAxiosError(undefined, false);

    expect(extractErrorMessage(error)).toBe("No server connection");
  });

  it("returns message from response data", () => {
    const error = makeAxiosError({ message: "Email already exists" });

    expect(extractErrorMessage(error)).toBe("Email already exists");
  });

  it("returns 'An unknown error occurred' when message is missing", () => {
    const error = makeAxiosError({ statusCode: 500 });

    expect(extractErrorMessage(error)).toBe("An unknown error occurred");
  });

  it("returns 'No server connection' for null error", () => {
    expect(extractErrorMessage(null)).toBe("No server connection");
  });
});

describe("extractFieldErrors", () => {
  it("returns empty object when no response data", () => {
    expect(extractFieldErrors(null)).toEqual({});
  });

  it("returns empty object when errors field is missing", () => {
    const error = makeAxiosError({ message: "Bad request" });

    expect(extractFieldErrors(error)).toEqual({});
  });

  it("returns first message for each field", () => {
    const error = makeAxiosError({
      errors: {
        email: ["Email is invalid", "Email is required"],
        password: ["Password too short"],
      },
    });

    expect(extractFieldErrors(error)).toEqual({
      email: "Email is invalid",
      password: "Password too short",
    });
  });

  it("ignores fields with empty message arrays", () => {
    const error = makeAxiosError({
      errors: {
        email: [],
        password: ["Password too short"],
      },
    });

    expect(extractFieldErrors(error)).toEqual({
      password: "Password too short",
    });
  });
});