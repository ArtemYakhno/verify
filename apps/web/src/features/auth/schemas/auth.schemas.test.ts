import { describe, it, expect } from "vitest";
import { loginFormSchema, registerFormSchema } from "./auth.schemas";

describe("loginFormSchema", () => {
  it("valid email + password — passes", () => {
    const result = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "Test1234",
    });
    expect(result.success).toBe(true);
  });

  it("invalid email — fails", () => {
    const result = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "Test1234",
    });
    expect(result.success).toBe(false);
  });

  it("empty password — fails", () => {
    const result = loginFormSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  const valid = {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "Test1234",
    confirmPassword: "Test1234",
  };

  it("valid data — passes", () => {
    expect(registerFormSchema.safeParse(valid).success).toBe(true);
  });

  it("passwords do not match — error on confirmPassword field", () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      const confirmError = result.error.issues.find((issue) =>
        issue.path.includes("confirmPassword"),
      );
      expect(confirmError).toBeDefined();
      expect(confirmError?.message).toBe("Passwords do not match");
    }
  });

  it("password without uppercase letter — fails", () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      password: "test1234",
      confirmPassword: "test1234",
    });
    expect(result.success).toBe(false);
  });

  it("password without a digit — fails", () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      password: "TestTest",
      confirmPassword: "TestTest",
    });
    expect(result.success).toBe(false);
  });

  it("password shorter than 8 characters — fails", () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      password: "T1a",
      confirmPassword: "T1a",
    });
    expect(result.success).toBe(false);
  });
});
