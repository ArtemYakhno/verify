import { describe, it, expect } from "vitest";
import { imagesQuerySchema } from "../image-query.schema";
import {
  DEFAULT_IMAGE_ORDER_BY,
  ORDER_BY_IMAGES,
} from "@/common/constants/pagination.constants";
import { ORDER_DIR } from "@/common/constants/pagination.constants";

describe("imagesQuerySchema", () => {

  it("parses valid full query", () => {
    const result = imagesQuerySchema.parse({
      page: 1,
      perPage: 10,
      orderBy: DEFAULT_IMAGE_ORDER_BY,
      orderDir: ORDER_DIR[0],
    });

    expect(result).toEqual({
      page: 1,
      perPage: 10,
      orderBy: DEFAULT_IMAGE_ORDER_BY,
      orderDir: ORDER_DIR[0],
    });
  });

  it("parses empty object using all defaults", () => {
    const result = imagesQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.perPage).toBe(12);
    expect(result.orderBy).toBe(DEFAULT_IMAGE_ORDER_BY);
    expect(result.orderDir).toBe(ORDER_DIR[1]);
  });

  it("accepts all valid ORDER_BY_IMAGES values", () => {
    for (const value of ORDER_BY_IMAGES) {
      const result = imagesQuerySchema.parse({ orderBy: value });

      expect(result.orderBy).toBe(value);
    }
  });

  it("falls back to DEFAULT_IMAGE_ORDER_BY for invalid orderBy", () => {
    const result = imagesQuerySchema.parse({ orderBy: "invalid" });

    expect(result.orderBy).toBe(DEFAULT_IMAGE_ORDER_BY);
  });


  it("coerces string page to number", () => {
    const result = imagesQuerySchema.parse({ page: "3" });

    expect(result.page).toBe(3);
  });

  it("falls back to page=1 for invalid page", () => {
    const result = imagesQuerySchema.parse({ page: 0 });

    expect(result.page).toBe(1);
  });

  it("falls back to perPage=12 when perPage exceeds max", () => {
    const result = imagesQuerySchema.parse({ perPage: 51 });

    expect(result.perPage).toBe(12);
  });
});