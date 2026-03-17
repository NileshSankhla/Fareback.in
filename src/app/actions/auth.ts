"use server";

import { randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  createSession,
  deleteSessionByToken,
  getSessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { passwordResetTokens, sessions, users } from "@/lib/db/schema";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

export interface AuthActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

const getSafeRedirectPath = (redirectTo: string) => {
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
};

export const signUpAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const payload = {
      name: getString(formData.get("name")).trim(),
      email: getString(formData.get("email")).trim().toLowerCase(),
      password: getString(formData.get("password")),
      confirmPassword: getString(formData.get("confirmPassword")),
    };

    const validation = signUpSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser) {
      return {
        error: "An account with this email already exists.",
        fieldErrors: { email: ["Email already in use."] },
      };
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        name: payload.name,
        email: payload.email,
        passwordHash: hashPassword(payload.password),
      })
      .returning({ id: users.id });

    await createSession(createdUser.id);
    redirect("/dashboard");
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      error: "An error occurred during sign up. Please try again.",
    };
  }
};

export const signInAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const payload = {
      email: getString(formData.get("email")).trim().toLowerCase(),
      password: getString(formData.get("password")),
      redirectTo: getString(formData.get("redirectTo")).trim(),
    };

    const validation = signInSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!existingUser?.passwordHash) {
      return { error: "Invalid email or password." };
    }

    const validPassword = verifyPassword(payload.password, existingUser.passwordHash);
    if (!validPassword) {
      return { error: "Invalid email or password." };
    }

    await createSession(existingUser.id);
    redirect(getSafeRedirectPath(payload.redirectTo));
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error: "An error occurred during sign in. Please try again.",
    };
  }
};

export const signOutAction = async () => {
  try {
    const sessionToken = await getSessionToken();
    if (sessionToken) {
      await deleteSessionByToken(sessionToken);
    }

    await clearSessionCookie();
    redirect("/");
  } catch (error) {
    console.error("Sign out error:", error);
    redirect("/");
  }
};

export const requestPasswordResetAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const payload = {
      email: getString(formData.get("email")).trim().toLowerCase(),
    };

    const validation = forgotPasswordSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (user) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      // Replace this with your email provider integration.
      console.info("Password reset link:", resetUrl);
    }

    return {
      success:
        "If an account exists for this email, a reset link has been generated.",
    };
  } catch (error) {
    console.error("Request password reset error:", error);
    return {
      error: "An error occurred while processing your request. Please try again.",
    };
  }
};

export const resetPasswordAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const payload = {
      token: getString(formData.get("token")).trim(),
      password: getString(formData.get("password")),
      confirmPassword: getString(formData.get("confirmPassword")),
    };

    const validation = resetPasswordSchema.safeParse(payload);
    if (!validation.success) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const [tokenRecord] = await db
      .select({
        userId: passwordResetTokens.userId,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, payload.token),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return {
        error: "This reset link is invalid or has expired.",
      };
    }

    await db
      .update(users)
      .set({
        passwordHash: hashPassword(payload.password),
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, tokenRecord.userId));

    await db.delete(sessions).where(eq(sessions.userId, tokenRecord.userId));

    return {
      success: "Password reset successful. You can now sign in.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      error: "An error occurred while resetting your password. Please try again.",
    };
  }
};
