import { describe, it, expect } from "vitest";
import { basePaginationQuerySchema } from "../paginationQuery.schema";

describe("basePaginationQuerySchema", () => {
  it("parses valid page and perPage", () => {
    const result = basePaginationQuerySchema.parse({ page: 2, perPage: 20 });

    expect(result).toEqual({ page: 2, perPage: 20 });
  });

  it("coerces string numbers to number", () => {
    const result = basePaginationQuerySchema.parse({
      page: "3",
      perPage: "15",
    });

    expect(result).toEqual({ page: 3, perPage: 15 });
  });

  it("falls back to page=1 when page is missing", () => {
    const result = basePaginationQuerySchema.parse({ perPage: 10 });

    expect(result.page).toBe(1);
  });

  it("falls back to perPage=12 when perPage is missing", () => {
    const result = basePaginationQuerySchema.parse({ page: 1 });

    expect(result.perPage).toBe(12);
  });

  it("falls back to page=1 when page is non-numeric string", () => {
    const result = basePaginationQuerySchema.parse({
      page: "abc",
      perPage: 10,
    });

    expect(result.page).toBe(1);
  });

  it("falls back to perPage=12 when perPage is non-numeric string", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: "abc" });

    expect(result.perPage).toBe(12);
  });

  it("falls back to page=1 when page is 0", () => {
    const result = basePaginationQuerySchema.parse({ page: 0, perPage: 10 });

    expect(result.page).toBe(1);
  });

  it("falls back to page=1 when page is negative", () => {
    const result = basePaginationQuerySchema.parse({ page: -5, perPage: 10 });

    expect(result.page).toBe(1);
  });

  it("falls back to perPage=12 when perPage exceeds max (50)", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: 51 });

    expect(result.perPage).toBe(12);
  });

  it("falls back to perPage=12 when perPage is 0", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: 0 });

    expect(result.perPage).toBe(12);
  });

  it("accepts page=1 (min boundary)", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: 10 });

    expect(result.page).toBe(1);
  });

  it("accepts perPage=1 (min boundary)", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: 1 });

    expect(result.perPage).toBe(1);
  });

  it("accepts perPage=50 (max boundary)", () => {
    const result = basePaginationQuerySchema.parse({ page: 1, perPage: 50 });

    expect(result.perPage).toBe(50);
  });

  it("falls back to page=1 when page is float", () => {
    const result = basePaginationQuerySchema.parse({ page: 1.5, perPage: 10 });

    expect(result.page).toBe(1);
  });
});
