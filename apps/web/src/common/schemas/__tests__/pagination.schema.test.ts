import { describe, it, expect } from "vitest";
import { paginationMetaSchema } from "../pagination.schema";

describe("paginationMetaSchema", () => {
  const validMeta = {
    total: 100,
    page: 1,
    perPage: 10,
    totalPages: 10,
    hasNextPage: true,
    hasPreviousPage: false,
  };

  it("parses valid pagination meta", () => {
    const result = paginationMetaSchema.safeParse(validMeta);

    expect(result.success).toBe(true);
  });

  it("fails when required field is missing", () => {
    const { total, ...withoutTotal } = validMeta;

    const result = paginationMetaSchema.safeParse(withoutTotal);

    expect(result.success).toBe(false);
  });

  it("fails when number field receives string", () => {
    const result = paginationMetaSchema.safeParse({
      ...validMeta,
      page: "1",
    });

    expect(result.success).toBe(false);
  });

  it("fails when boolean field receives non-boolean", () => {
    const result = paginationMetaSchema.safeParse({
      ...validMeta,
      hasNextPage: 1,
    });

    expect(result.success).toBe(false);
  });
});