import { describe, it, expect } from "vitest";
import { updateProfileSchema, changePasswordSchema } from "./profile.schema";

describe("updateProfileSchema", () => {
  const valid = { firstname: "John", lastname: "Doe" };

  it("valid firstname and lastname — passes", () => {
    expect(updateProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("firstname with digits — fails", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, firstname: "John123" }).success,
    ).toBe(false);
  });

  it("lastname with digits — fails", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, lastname: "Doe456" }).success,
    ).toBe(false);
  });

  it("empty firstname — fails", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, firstname: "" }).success,
    ).toBe(false);
  });

  it("empty lastname — fails", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, lastname: "" }).success,
    ).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "OldPass1",
    newPassword: "NewPass1",
    confirmPassword: "NewPass1",
  };

  it("valid data — passes", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("newPassword !== confirmPassword — error on confirmPassword field", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmPassword: "Different1",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("confirmPassword"),
      );
      expect(issue).toBeDefined();
      expect(issue?.message).toBe("Passwords do not match");
    }
  });

  it("empty confirmPassword — fails", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, confirmPassword: "" }).success,
    ).toBe(false);
  });

  it("currentPassword without uppercase — fails", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: "oldpass1" })
        .success,
    ).toBe(false);
  });

  it("currentPassword without digit — fails", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        currentPassword: "OldPasswd",
      }).success,
    ).toBe(false);
  });

  it("currentPassword shorter than 8 characters — fails", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: "Old1" })
        .success,
    ).toBe(false);
  });

  it("newPassword without uppercase — fails", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "newpass1",
        confirmPassword: "newpass1",
      }).success,
    ).toBe(false);
  });

  it("newPassword without digit — fails", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "NewPasswd",
        confirmPassword: "NewPasswd",
      }).success,
    ).toBe(false);
  });

  it("newPassword shorter than 8 characters — fails", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "New1",
        confirmPassword: "New1",
      }).success,
    ).toBe(false);
  });
});
