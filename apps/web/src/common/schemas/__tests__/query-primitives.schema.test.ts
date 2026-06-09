import { describe, it, expect } from "vitest";
import { createSortingQuerySchema } from "../query-primitives.schema";
import { createIntRangeQuerySchema } from "../query-primitives.schema";
import { optionalDateQuerySchema } from "../query-primitives.schema";
import { optionalStringQuerySchema } from "../query-primitives.schema";
import { ORDER_DIR } from "@/common/constants/pagination.constants";

describe("createSortingQuerySchema", () => {
  const schema = createSortingQuerySchema(
    ["name", "createdAt", "updatedAt"] as const,
    "createdAt",
  );

  it("parses valid orderBy and orderDir", () => {
    const result = schema.parse({ orderBy: "name", orderDir: ORDER_DIR[0] });

    expect(result).toEqual({ orderBy: "name", orderDir: ORDER_DIR[0] });
  });

  it("falls back to defaultOrderBy when orderBy is invalid", () => {
    const result = schema.parse({ orderBy: "invalid", orderDir: ORDER_DIR[0] });

    expect(result.orderBy).toBe("createdAt");
  });

  it("falls back to ORDER_DIR[1] when orderDir is invalid", () => {
    const result = schema.parse({ orderBy: "name", orderDir: "SIDEWAYS" });

    expect(result.orderDir).toBe(ORDER_DIR[1]);
  });

  it("falls back to both defaults when both fields are invalid", () => {
    const result = schema.parse({ orderBy: "unknown", orderDir: "unknown" });

    expect(result).toEqual({ orderBy: "createdAt", orderDir: ORDER_DIR[1] });
  });

  it("falls back to defaults when fields are missing", () => {
    const result = schema.parse({});

    expect(result.orderBy).toBe("createdAt");
    expect(result.orderDir).toBe(ORDER_DIR[1]);
  });

  it("uses the correct defaultOrderBy per schema instance", () => {
    const otherSchema = createSortingQuerySchema(
      ["price", "rating"] as const,
      "rating",
    );

    const result = otherSchema.parse({
      orderBy: "INVALID",
      orderDir: "INVALID",
    });

    expect(result.orderBy).toBe("rating");
  });
});

describe("createIntRangeQuerySchema", () => {
  const schema = createIntRangeQuerySchema(1, 100, 10);

  describe("valid values", () => {
    it.each([
      [50, 50],
      ["42", 42],
      [1, 1],
      [100, 100],
    ])("parses %p as %p", (input, expected) => {
      expect(schema.parse(input)).toBe(expected);
    });
  });

  describe("empty values", () => {
    it.each([
      ["", 10],
      [null, 10],
      [undefined, 10],
    ])("returns defaultValue for %p", (input, expected) => {
      expect(schema.parse(input)).toBe(expected);
    });
  });

  describe("invalid values", () => {
    it.each([
      [0, 10],
      [101, 10],
      [5.5, 10],
      ["abc", 10],
    ])("falls back to defaultValue for %p", (input, expected) => {
      expect(schema.parse(input)).toBe(expected);
    });
  });
});

describe("optionalDateQuerySchema", () => {
  it("passes through a valid ISO date string", () => {
    expect(optionalDateQuerySchema.parse("2024-01-15")).toBe("2024-01-15");
  });

  it("passes through a valid datetime string", () => {
    expect(optionalDateQuerySchema.parse("2024-01-15T10:30:00Z")).toBe(
      "2024-01-15T10:30:00Z",
    );
  });

  it("trims whitespace before validating", () => {
    expect(optionalDateQuerySchema.parse("  2024-01-15  ")).toBe("2024-01-15");
  });

  it("returns undefined for empty string", () => {
    expect(optionalDateQuerySchema.parse("")).toBeUndefined();
  });

  it("returns undefined for whitespace-only string", () => {
    expect(optionalDateQuerySchema.parse("   ")).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(optionalDateQuerySchema.parse(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(optionalDateQuerySchema.parse(undefined)).toBeUndefined();
  });

  it("returns undefined for number input", () => {
    expect(optionalDateQuerySchema.parse(20240115)).toBeUndefined();
  });

  it("returns undefined for boolean input", () => {
    expect(optionalDateQuerySchema.parse(true)).toBeUndefined();
  });

  it("returns undefined for invalid date string", () => {
    expect(optionalDateQuerySchema.parse("not-a-date")).toBeUndefined();
  });

  it("returns undefined for partial date string", () => {
    expect(optionalDateQuerySchema.parse("2024-13-45")).toBeUndefined();
  });
});

describe("optionalStringQuerySchema", () => {
  it("passes through a valid string", () => {
    expect(optionalStringQuerySchema.parse("hello")).toBe("hello");
  });

  it("trims leading and trailing whitespace", () => {
    expect(optionalStringQuerySchema.parse("  hello world  ")).toBe(
      "hello world",
    );
  });

  it("returns empty string for empty string input", () => {
    expect(optionalStringQuerySchema.parse("")).toBe("");
  });

  it("returns empty string for whitespace-only string", () => {
    expect(optionalStringQuerySchema.parse("   ")).toBe("");
  });

  it("falls back to empty string for non-string input (catch)", () => {
    expect(optionalStringQuerySchema.parse(123)).toBe("");
    expect(optionalStringQuerySchema.parse(null)).toBe("");
    expect(optionalStringQuerySchema.parse(undefined)).toBe("");
  });
});
