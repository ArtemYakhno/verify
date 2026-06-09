import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  nameSchema,
  nullableNormalizedSchema,
  passwordSchema,
} from "../primitives.schema";

describe("passwordSchema", () => {
  it("accepts valid password", () => {
    expect(passwordSchema.safeParse("Test1234").success).toBe(true);
  });

  it("fails when shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("Ab1");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Minimum 8 characters");
  });

  it("fails when longer than 32 characters", () => {
    const result = passwordSchema.safeParse("Abcdefgh1".repeat(4));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Maximum 32 characters");
  });

  it("accepts password at min boundary (8 chars)", () => {
    expect(passwordSchema.safeParse("Abcdef1g").success).toBe(true);
  });

  it("accepts password at max boundary (32 chars)", () => {
    expect(passwordSchema.safeParse("Abcdefgh1".padEnd(32, "a")).success).toBe(
      true,
    );
  });


  it("fails when no digit", () => {
    const result = passwordSchema.safeParse("Abcdefgh");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Must contain at least one number",
    );
  });

  it("fails when no lowercase letter", () => {
    const result = passwordSchema.safeParse("ABCDEFG1");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Must contain at least one lowercase letter",
    );
  });

  it("fails when no uppercase letter", () => {
    const result = passwordSchema.safeParse("abcdefg1");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Must contain at least one uppercase letter",
    );
  });
});

describe("nameSchema", () => {
  it("accepts valid name", () => {
    expect(nameSchema.safeParse("John").success).toBe(true);
  });

  it("accepts name with space (two words)", () => {
    expect(nameSchema.safeParse("Mary Jane").success).toBe(true);
  });

  it("accepts name with hyphen", () => {
    expect(nameSchema.safeParse("Anne-Marie").success).toBe(true);
  });

  it("accepts name with apostrophe", () => {
    expect(nameSchema.safeParse("O'Brien").success).toBe(true);
  });

  it("accepts unicode letters (Ukrainian)", () => {
    expect(nameSchema.safeParse("Тарас").success).toBe(true);
  });

  it("trims leading and trailing spaces before validation", () => {
    const result = nameSchema.safeParse("  John  ");

    expect(result.success).toBe(true);
    expect(result.data).toBe("John");
  });

  it("fails when shorter than 2 characters", () => {
    const result = nameSchema.safeParse("A");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Minimum 2 characters");
  });

  it("fails when longer than 50 characters", () => {
    const result = nameSchema.safeParse("A".repeat(51));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Maximum 50 characters");
  });

  it("fails when contains digits", () => {
    const result = nameSchema.safeParse("John123");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Must contain letters only");
  });

  it("fails when contains special characters", () => {
    const result = nameSchema.safeParse("John@Doe");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Must contain letters only");
  });

  it("fails when trailing space after trim still violates regex (double space)", () => {
    const result = nameSchema.safeParse("John  Doe");

    expect(result.success).toBe(false);
  });
});

describe("nullableNormalizedSchema", () => {
  const schema = nullableNormalizedSchema(z.string().min(2));

  it("passes valid string through", () => {
    const result = schema.safeParse("hello");

    expect(result.success).toBe(true);
    expect(result.data).toBe("hello");
  });

  it("transforms empty string to null", () => {
    const result = schema.safeParse("");

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it("passes null through", () => {
    const result = schema.safeParse(null);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it("fails when string is too short (piped schema validation)", () => {
    const result = schema.safeParse("a");

    expect(result.success).toBe(false);
  });

  it("works with nameSchema as inner schema", () => {
    const nameOrNull = nullableNormalizedSchema(nameSchema);

    expect(nameOrNull.safeParse("").data).toBeNull();
    expect(nameOrNull.safeParse("John").data).toBe("John");
    expect(nameOrNull.safeParse("J").success).toBe(false);
  });
});
