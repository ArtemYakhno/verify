import { describe, it, expect } from "vitest";
import {
  getSearchWith,
  normalizeParam,
  removeEmptyParams,
  searchParamsToObject,
} from "./searchHelper";

describe("getSearchWith", () => {
  it("sets a new param", () => {
    const current = new URLSearchParams("page=1");

    const result = getSearchWith(current, { limit: "10" });

    expect(result).toContain("page=1");
    expect(result).toContain("limit=10");
  });

  it("updates an existing param", () => {
    const current = new URLSearchParams("page=1");

    const result = getSearchWith(current, { page: "2" });

    expect(result).toBe("page=2");
  });

  it("deletes param when value is null", () => {
    const current = new URLSearchParams("page=1&limit=10");

    const result = getSearchWith(current, { page: null });

    expect(result).not.toContain("page");
    expect(result).toContain("limit=10");
  });

  it("does not change params when value is undefined", () => {
    const current = new URLSearchParams("page=1");

    const result = getSearchWith(current, { page: undefined });

    expect(result).toBe("page=1");
  });

  it("sets multiple values for array param", () => {
    const current = new URLSearchParams();

    const result = getSearchWith(current, { tags: ["a", "b", "c"] });

    expect(result).toContain("tags=a");
    expect(result).toContain("tags=b");
    expect(result).toContain("tags=c");
  });

  it("replaces existing array param with new array", () => {
    const current = new URLSearchParams("tags=old1&tags=old2");

    const result = getSearchWith(current, { tags: ["new1"] });

    const params = new URLSearchParams(result);
    expect(params.getAll("tags")).toEqual(["new1"]);
  });

  it("deletes array param when value is null", () => {
    const current = new URLSearchParams("tags=a&tags=b");

    const result = getSearchWith(current, { tags: null });

    expect(result).not.toContain("tags");
  });

  it("does not mutate original params", () => {
    const current = new URLSearchParams("page=1");

    getSearchWith(current, { page: "2" });

    expect(current.get("page")).toBe("1");
  });
});

describe("normalizeParam", () => {
  it("returns null when value equals defaultValue", () => {
    expect(normalizeParam("all", "all")).toBeNull();
  });

  it("returns undefined when value is undefined", () => {
    expect(normalizeParam(undefined)).toBeUndefined();
  });

  it("returns null when value is null", () => {
    expect(normalizeParam(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeParam("   ")).toBeNull();
  });

  it("returns stringified value for valid string", () => {
    expect(normalizeParam("active")).toBe("active");
  });

  it("returns stringified value for number", () => {
    expect(normalizeParam(42)).toBe("42");
  });

  it("returns stringified value for boolean", () => {
    expect(normalizeParam(true)).toBe("true");
  });

  it("returns value when no defaultValue provided and value is valid", () => {
    expect(normalizeParam("hello")).toBe("hello");
  });
});

describe("removeEmptyParams", () => {
  it("removes null values", () => {
    const result = removeEmptyParams({ page: 1, search: null });

    expect(result).toEqual({ page: 1 });
  });

  it("removes undefined values", () => {
    const result = removeEmptyParams({ page: 1, search: undefined });

    expect(result).toEqual({ page: 1 });
  });

  it("removes empty string values", () => {
    const result = removeEmptyParams({ page: 1, search: "" });

    expect(result).toEqual({ page: 1 });
  });

  it("removes whitespace-only string values", () => {
    const result = removeEmptyParams({ page: 1, search: "   " });

    expect(result).toEqual({ page: 1 });
  });

  it("keeps valid string values", () => {
    const result = removeEmptyParams({ search: "hello" });

    expect(result).toEqual({ search: "hello" });
  });

  it("keeps zero as valid value", () => {
    const result = removeEmptyParams({ page: 0 });

    expect(result).toEqual({ page: 0 });
  });

  it("keeps false as valid value", () => {
    const result = removeEmptyParams({ active: false });

    expect(result).toEqual({ active: false });
  });

  it("returns empty object when all params are empty", () => {
    const result = removeEmptyParams({ a: null, b: undefined, c: "" });

    expect(result).toEqual({});
  });

  it("returns same object when all params are valid", () => {
    const result = removeEmptyParams({ page: 1, limit: 10 });

    expect(result).toEqual({ page: 1, limit: 10 });
  });
});

describe("searchParamsToObject", () => {
  it("converts URLSearchParams to plain object", () => {
    const params = new URLSearchParams("page=1&limit=10");

    expect(searchParamsToObject(params)).toEqual({ page: "1", limit: "10" });
  });

  it("returns empty object for empty URLSearchParams", () => {
    const params = new URLSearchParams();

    expect(searchParamsToObject(params)).toEqual({});
  });

  it("returns last value for duplicate keys", () => {
    const params = new URLSearchParams("tag=a&tag=b");
    const result = searchParamsToObject(params);

    expect(result.tag).toBe("b");
  });
});
