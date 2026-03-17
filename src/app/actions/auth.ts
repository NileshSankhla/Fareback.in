"use server";

import { eq } from "drizzle-orm";
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
import { users } from "@/lib/db/schema";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const getString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

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
    redirect("/dashboard");
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
