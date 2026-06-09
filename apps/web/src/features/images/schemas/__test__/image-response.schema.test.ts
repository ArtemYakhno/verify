import { describe, it, expect } from "vitest";
import { galleryImagesSchema, paginatedImagesSchema } from "../image-response.schema";

const validImage = {
  id: 1,
  path: "https://example.com/photo.jpg",
  galleryId: 42,
  originalFilename: "photo.jpg",
  name: "My Photo",
  comment: "Nice view",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

const validMeta = {
  total: 100,
  page: 1,
  perPage: 10,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: false,
};

describe("galleryImagesSchema", () => {
  it("parses valid array of images", () => {
    expect(galleryImagesSchema.safeParse([validImage]).success).toBe(true);
  });

  it("parses empty array", () => {
    expect(galleryImagesSchema.safeParse([]).success).toBe(true);
  });

  it("fails when one item in array is invalid", () => {
    const result = galleryImagesSchema.safeParse([
      validImage,
      { ...validImage, id: "not-a-number" },
    ]);

    expect(result.success).toBe(false);
  });
});


describe("paginatedImagesSchema", () => {
  it("parses valid paginated response", () => {
    const result = paginatedImagesSchema.safeParse({
      data: [validImage],
      meta: validMeta,
    });

    expect(result.success).toBe(true);
  });

  it("parses with empty data array", () => {
    const result = paginatedImagesSchema.safeParse({
      data: [],
      meta: validMeta,
    });

    expect(result.success).toBe(true);
  });

  it("fails when data is missing", () => {
    const result = paginatedImagesSchema.safeParse({ meta: validMeta });

    expect(result.success).toBe(false);
  });

  it("fails when meta is missing", () => {
    const result = paginatedImagesSchema.safeParse({ data: [validImage] });

    expect(result.success).toBe(false);
  });

  it("fails when meta has invalid shape", () => {
    const result = paginatedImagesSchema.safeParse({
      data: [validImage],
      meta: { ...validMeta, total: "hundred" },
    });

    expect(result.success).toBe(false);
  });
});