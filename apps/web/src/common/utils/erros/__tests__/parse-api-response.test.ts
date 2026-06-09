import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseApiResponse } from "../parse-api-response";
import { ApiValidationError } from "../errors";


const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const numberSchema = z.number();

describe("parseApiResponse", () => {
  it("returns parsed data when valid", () => {
    const data = { id: 1, name: "John" };

    const result = parseApiResponse(userSchema, data);

    expect(result).toEqual({ id: 1, name: "John" });
  });

  it("throws ApiValidationError when data is invalid", () => {
    const data = { id: "not-a-number", name: "John" };

    expect(() => parseApiResponse(userSchema, data)).toThrow(
      ApiValidationError,
    );
  });

  it("throws ApiValidationError with correct name", () => {
    expect(() => parseApiResponse(userSchema, null)).toThrow(
      expect.objectContaining({ name: "ApiValidationError" }),
    );
  });

  it("throws ApiValidationError that contains zodError", () => {
    let thrown: unknown;

    try {
      parseApiResponse(userSchema, { id: "bad" });
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(ApiValidationError);
    expect((thrown as ApiValidationError).zodError).toBeDefined();
  });

  it("returns primitive value for primitive schema", () => {
    const result = parseApiResponse(numberSchema, 42);

    expect(result).toBe(42);
  });

  it("throws for wrong primitive type", () => {
    expect(() => parseApiResponse(numberSchema, "42")).toThrow(
      ApiValidationError,
    );
  });

  it("works with array schema", () => {
    const data = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];

    const result = parseApiResponse(userSchema.array(), data);

    expect(result).toEqual(data);
  });

  it("throws for invalid item in array", () => {
    const data = [
      { id: 1, name: "A" },
      { id: "bad", name: "B" },
    ];

    expect(() => parseApiResponse(userSchema.array(), data)).toThrow(
      ApiValidationError,
    );
  });

  it("throws for null input", () => {
    expect(() => parseApiResponse(userSchema, null)).toThrow(
      ApiValidationError,
    );
  });

  it("throws for undefined input", () => {
    expect(() => parseApiResponse(userSchema, undefined)).toThrow(
      ApiValidationError,
    );
  });
});
