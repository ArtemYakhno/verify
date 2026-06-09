import { describe, it, expect } from "vitest";
import { userSchema } from "../user.schema";

const validUser = {
  id: 1,
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@example.com",
  role: "USER" as const,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

describe("userSchema", () => {
  it("parses a valid user", () => {
    const result = userSchema.safeParse(validUser);

    expect(result.success).toBe(true);
  });

  it("coerces ISO string to Date instance", () => {
    const result = userSchema.safeParse(validUser);

    expect(result.data?.createdAt).toBeInstanceOf(Date);
    expect(result.data?.updatedAt).toBeInstanceOf(Date);
  });

  it("fails when date string is invalid", () => {
    const result = userSchema.safeParse({
      ...validUser,
      createdAt: "not-a-date",
    });

    expect(result.success).toBe(false);
  });

  it("accepts role ADMIN", () => {
    const result = userSchema.safeParse({ ...validUser, role: "ADMIN" });

    expect(result.success).toBe(true);
  });

  it("fails when role is invalid", () => {
    const result = userSchema.safeParse({ ...validUser, role: "MODERATOR" });

    expect(result.success).toBe(false);
  });

  it("fails when email is invalid", () => {
    const result = userSchema.safeParse({
      ...validUser,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("fails when firstname violates nameSchema", () => {
    const result = userSchema.safeParse({ ...validUser, firstname: "J" });

    expect(result.success).toBe(false);
  });

  it("fails when lastname contains digits", () => {
    const result = userSchema.safeParse({ ...validUser, lastname: "Doe123" });

    expect(result.success).toBe(false);
  });

  it("fails when required field is missing", () => {
    const { email, ...withoutEmail } = validUser;

    const result = userSchema.safeParse(withoutEmail);

    expect(result.success).toBe(false);
  });
});
