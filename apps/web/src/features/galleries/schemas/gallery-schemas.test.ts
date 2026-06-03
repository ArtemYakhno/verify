import { describe, it, expect } from "vitest";
import {
  galleryTitleSchema,
  galleryDescriptionSchema,
} from "./gallery-base.schema";
import {
  fieldsGallerySchema,
  updateFieldsGallerySchema,
} from "./gallery-request.schema";
import { galleriesQuerySchema } from "./gallery-query.schema";
import {
  DEFAULT_GALLERY_ORDER_BY,
  GALLERY_IMAGES_COUNT_MAX,
  GALLERY_IMAGES_COUNT_MIN,
} from "@/common/constants/pagination.constants";

// ─── gallery-base.schema ──────────────────────────────────────────────────────

describe("galleryTitleSchema", () => {
  it("accepts a valid title", () => {
    expect(galleryTitleSchema.safeParse("My Gallery").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(galleryTitleSchema.safeParse("").success).toBe(false);
  });

  it("rejects a single character (below min of 2)", () => {
    expect(galleryTitleSchema.safeParse("A").success).toBe(false);
  });

  it("accepts exactly 2 characters (min boundary)", () => {
    expect(galleryTitleSchema.safeParse("AB").success).toBe(true);
  });

  it("accepts exactly 50 characters (max boundary)", () => {
    expect(galleryTitleSchema.safeParse("A".repeat(50)).success).toBe(true);
  });

  it("rejects 51 characters (above max of 50)", () => {
    expect(galleryTitleSchema.safeParse("A".repeat(51)).success).toBe(false);
  });

  it("returns correct message when below min length", () => {
    const result = galleryTitleSchema.safeParse("A");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Title must be at least 2 characters",
    );
  });

  it("returns correct message when above max length", () => {
    const result = galleryTitleSchema.safeParse("A".repeat(51));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Title must be at most 50 characters",
    );
  });
});

describe("galleryDescriptionSchema", () => {
  it("accepts an empty string", () => {
    expect(galleryDescriptionSchema.safeParse("").success).toBe(true);
  });

  it("accepts exactly 255 characters (max boundary)", () => {
    expect(galleryDescriptionSchema.safeParse("A".repeat(255)).success).toBe(
      true,
    );
  });

  it("rejects 256 characters (above max of 255)", () => {
    expect(galleryDescriptionSchema.safeParse("A".repeat(256)).success).toBe(
      false,
    );
  });

  it("returns correct message when above max length", () => {
    const result = galleryDescriptionSchema.safeParse("A".repeat(256));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Description must be at most 255 characters",
    );
  });
});

// ─── gallery-request.schema ───────────────────────────────────────────────────

describe("fieldsGallerySchema", () => {
  it("accepts valid title and description", () => {
    const result = fieldsGallerySchema.safeParse({
      title: "My Gallery",
      description: "Some description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when title is missing", () => {
    const result = fieldsGallerySchema.safeParse({ description: "desc" });
    expect(result.success).toBe(false);
  });

  it("accepts null as description (nullable)", () => {
    const result = fieldsGallerySchema.safeParse({
      title: "My Gallery",
      description: null,
    });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });

  it("normalizes empty string description to null", () => {
    const result = fieldsGallerySchema.safeParse({
      title: "My Gallery",
      description: "",
    });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });

  it("rejects description that exceeds max length", () => {
    const result = fieldsGallerySchema.safeParse({
      title: "My Gallery",
      description: "A".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateFieldsGallerySchema", () => {
  it("accepts an empty object (all fields are optional)", () => {
    expect(updateFieldsGallerySchema.safeParse({}).success).toBe(true);
  });

  it("accepts title only", () => {
    const result = updateFieldsGallerySchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("New Title");
  });

  it("accepts description only", () => {
    const result = updateFieldsGallerySchema.safeParse({ description: "desc" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid title when provided", () => {
    const result = updateFieldsGallerySchema.safeParse({ title: "A" });
    expect(result.success).toBe(false);
  });

  it("normalizes empty string description to null", () => {
    const result = updateFieldsGallerySchema.safeParse({ description: "" });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });
});

// ─── gallery-query.schema (defaults only) ─────────────────────────────────────

describe("galleriesQuerySchema", () => {
  it("returns expected default values when given an empty object", () => {
    const result = galleriesQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.orderBy).toBe(DEFAULT_GALLERY_ORDER_BY);
    expect(result.minImages).toBe(GALLERY_IMAGES_COUNT_MIN);
    expect(result.maxImages).toBe(GALLERY_IMAGES_COUNT_MAX);
    expect(result.search).toBe("");
    expect(result.createdFrom).toBeUndefined();
    expect(result.createdTo).toBeUndefined();
  });
});
