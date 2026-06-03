import { describe, it, expect } from "vitest";
import {
  imageFileSchema,
  imageMetadataSchema,
  updateImageMetadataSchema,
  uploadImageItemSchema,
  uploadImagesSchema,
  updateImageItemSchema,
  updateImagesSchema,
} from "../image-request.schema";
import {
  ALLOWED_IMAGES_TYPES,
  MAX_FILES,
  MAX_FILE_SIZE,
} from "../../constants/image.constants";

function makeFile(
  name: string,
  size: number,
  type: string = ALLOWED_IMAGES_TYPES[0],
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

const validFile = makeFile("photo.jpg", 1024);

const validMetadata = { name: "My Photo", comment: "Nice view" };

const validUploadItem = { file: validFile, ...validMetadata };

const validUpdateItem = {
  id: 1,
  path: "https://example.com/photo.jpg",
  name: "My Photo",
  comment: "Nice view",
};

describe("imageFileSchema", () => {
  it("accepts valid file", () => {
    expect(imageFileSchema.safeParse(validFile).success).toBe(true);
  });

  it("fails when value is not a File instance", () => {
    const result = imageFileSchema.safeParse("not-a-file");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Image file is required");
  });

  it("fails when file exceeds MAX_FILE_SIZE", () => {
    const bigFile = makeFile("big.jpg", MAX_FILE_SIZE + 1);
    const result = imageFileSchema.safeParse(bigFile);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Image must be at most 5 MB");
  });

  it("accepts file at exact MAX_FILE_SIZE boundary", () => {
    const boundaryFile = makeFile("boundary.jpg", MAX_FILE_SIZE);

    expect(imageFileSchema.safeParse(boundaryFile).success).toBe(true);
  });

  it("fails when file type is not allowed", () => {
    const txtFile = makeFile("file.txt", 1024, "text/plain");
    const result = imageFileSchema.safeParse(txtFile);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("Unsupported image type");
  });

  it("accepts all ALLOWED_IMAGES_TYPES", () => {
    for (const type of ALLOWED_IMAGES_TYPES) {
      const ext = type.split("/")[1];
      const file = makeFile(`photo.${ext}`, 1024, type);

      expect(imageFileSchema.safeParse(file).success).toBe(true);
    }
  });
});

describe("imageMetadataSchema", () => {
  it("parses valid metadata", () => {
    expect(imageMetadataSchema.safeParse(validMetadata).success).toBe(true);
  });

  it("transforms empty string name to null", () => {
    const result = imageMetadataSchema.safeParse({ name: "", comment: "" });

    expect(result.data?.name).toBeNull();
    expect(result.data?.comment).toBeNull();
  });

  it("accepts null for name and comment", () => {
    const result = imageMetadataSchema.safeParse({ name: null, comment: null });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBeNull();
    expect(result.data?.comment).toBeNull();
  });

  it("trims whitespace from name", () => {
    const result = imageMetadataSchema.safeParse({
      name: "  My Photo  ",
      comment: null,
    });

    expect(result.data?.name).toBe("My Photo");
  });

  it("fails when name exceeds 100 characters", () => {
    const result = imageMetadataSchema.safeParse({
      name: "a".repeat(101),
      comment: null,
    });

    expect(result.success).toBe(false);
  });
});

describe("updateImageMetadataSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateImageMetadataSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial update with only name", () => {
    const result = updateImageMetadataSchema.safeParse({ name: "New Name" });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("New Name");
  });

  it("accepts partial update with only comment", () => {
    const result = updateImageMetadataSchema.safeParse({
      comment: "New comment",
    });

    expect(result.success).toBe(true);
  });
});

describe("uploadImageItemSchema", () => {
  it("parses valid upload item", () => {
    expect(uploadImageItemSchema.safeParse(validUploadItem).success).toBe(true);
  });

  it("fails when file is missing", () => {
    const result = uploadImageItemSchema.safeParse(validMetadata);

    expect(result.success).toBe(false);
  });

  it("fails when file is invalid", () => {
    const result = uploadImageItemSchema.safeParse({
      ...validMetadata,
      file: makeFile("big.jpg", MAX_FILE_SIZE + 1),
    });

    expect(result.success).toBe(false);
  });
});

describe("uploadImagesSchema", () => {
  it("parses valid uploads array", () => {
    const result = uploadImagesSchema.safeParse({
      uploads: [validUploadItem],
    });

    expect(result.success).toBe(true);
  });

  it("accepts empty uploads array", () => {
    expect(uploadImagesSchema.safeParse({ uploads: [] }).success).toBe(true);
  });

  it("fails when uploads exceed MAX_FILES", () => {
    const uploads = Array.from(
      { length: MAX_FILES + 1 },
      () => validUploadItem,
    );
    const result = uploadImagesSchema.safeParse({ uploads });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      `You can upload at most ${MAX_FILES} images`,
    );
  });

  it("accepts uploads at MAX_FILES boundary", () => {
    const uploads = Array.from({ length: MAX_FILES }, () => validUploadItem);

    expect(uploadImagesSchema.safeParse({ uploads }).success).toBe(true);
  });
});

describe("updateImageItemSchema", () => {
  it("parses valid update item", () => {
    expect(updateImageItemSchema.safeParse(validUpdateItem).success).toBe(true);
  });

  it("fails when id is missing", () => {
    const { id, ...withoutId } = validUpdateItem;

    expect(updateImageItemSchema.safeParse(withoutId).success).toBe(false);
  });

  it("fails when path is not a valid URL", () => {
    const result = updateImageItemSchema.safeParse({
      ...validUpdateItem,
      path: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  it("accepts null for name and comment (partial metadata)", () => {
    const result = updateImageItemSchema.safeParse({
      ...validUpdateItem,
      name: null,
      comment: null,
    });

    expect(result.success).toBe(true);
  });
});

describe("updateImagesSchema", () => {
  it("parses valid array of update items", () => {
    expect(updateImagesSchema.safeParse([validUpdateItem]).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(updateImagesSchema.safeParse([]).success).toBe(true);
  });

  it("fails when one item in array is invalid", () => {
    const result = updateImagesSchema.safeParse([
      validUpdateItem,
      { ...validUpdateItem, id: "not-a-number" },
    ]);

    expect(result.success).toBe(false);
  });
});
