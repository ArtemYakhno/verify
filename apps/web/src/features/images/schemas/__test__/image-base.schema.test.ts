import { describe, it, expect } from "vitest";
import {
  imageNameSchema,
  imageCommentSchema,
  imageSchema,
} from "../image-base.schema";

const validImage = {
  id: 1,
  path: "https://example.com/image.jpg",
  galleryId: 42,
  originalFilename: "photo.jpg",
  name: "My Photo",
  comment: "A nice view",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

describe("imageNameSchema", () => {
  it("accepts valid name", () => {
    expect(imageNameSchema.safeParse("My Photo").success).toBe(true);
  });

  it("accepts empty string", () => {
    expect(imageNameSchema.safeParse("").success).toBe(true);
  });

  it("accepts name at max boundary (100 chars)", () => {
    expect(imageNameSchema.safeParse("a".repeat(100)).success).toBe(true);
  });

  it("fails when name exceeds 100 characters", () => {
    const result = imageNameSchema.safeParse("a".repeat(101));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Name must be at most 100 characters",
    );
  });
});

describe("imageCommentSchema", () => {
  it("accepts valid comment", () => {
    expect(imageCommentSchema.safeParse("A nice view").success).toBe(true);
  });

  it("fails when comment exceeds 100 characters", () => {
    const result = imageCommentSchema.safeParse("a".repeat(101));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Comment must be at most 100 characters",
    );
  });
});

describe("imageSchema", () => {
  it("parses a valid image", () => {
    const result = imageSchema.safeParse(validImage);

    expect(result.success).toBe(true);
  });

  it("accepts null for name", () => {
    const result = imageSchema.safeParse({ ...validImage, name: null });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBeNull();
  });

  it("accepts null for comment", () => {
    const result = imageSchema.safeParse({ ...validImage, comment: null });

    expect(result.success).toBe(true);
    expect(result.data?.comment).toBeNull();
  });

  it("fails when name exceeds 100 characters", () => {
    const result = imageSchema.safeParse({
      ...validImage,
      name: "a".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("fails when path is not a valid URL", () => {
    const result = imageSchema.safeParse({ ...validImage, path: "not-a-url" });

    expect(result.success).toBe(false);
  });

  it("fails when path is a relative path", () => {
    const result = imageSchema.safeParse({
      ...validImage,
      path: "/images/photo.jpg",
    });

    expect(result.success).toBe(false);
  });

  it("coerces ISO string to Date instance", () => {
    const result = imageSchema.safeParse(validImage);

    expect(result.data?.createdAt).toBeInstanceOf(Date);
    expect(result.data?.updatedAt).toBeInstanceOf(Date);
  });

  it("fails when createdAt is invalid date string", () => {
    const result = imageSchema.safeParse({
      ...validImage,
      createdAt: "not-a-date",
    });

    expect(result.success).toBe(false);
  });

  it("fails when required field is missing", () => {
    const { galleryId, ...withoutGalleryId } = validImage;

    const result = imageSchema.safeParse(withoutGalleryId);

    expect(result.success).toBe(false);
  });
});
