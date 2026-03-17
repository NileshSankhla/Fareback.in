import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

describe("auth validation schemas", () => {
  it("accepts valid sign-in input", () => {
    const result = signInSchema.safeParse({
      email: "john@example.com",
      password: "Password1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched sign-up passwords", () => {
    const result = signUpSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "Password1",
      confirmPassword: "Password2",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid forgot-password input", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects reset-password input when token is missing", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "Password1",
      confirmPassword: "Password1",
    });

    expect(result.success).toBe(false);
  });
});
