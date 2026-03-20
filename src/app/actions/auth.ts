"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  clearSessionCookie,
  createSession,
  deleteSessionByToken,
  getSessionToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";

export interface AuthActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

export const signUpAction = async (
  _prevState: AuthActionState,
  _formData: FormData,
): Promise<AuthActionState> => {
  return {
    error: "Email/password sign-up is disabled. Please continue with Google.",
  };
};

export const signInAction = async (
  _prevState: AuthActionState,
  _formData: FormData,
): Promise<AuthActionState> => {
  return {
    error: "Email/password sign-in is disabled. Please continue with Google.",
  };
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
  _formData: FormData,
): Promise<AuthActionState> => {
  return {
    error: "Password reset is disabled. Please continue with Google.",
  };
};

export const resetPasswordAction = async (
  _prevState: AuthActionState,
  _formData: FormData,
): Promise<AuthActionState> => {
  return {
    error: "Password reset is disabled. Please continue with Google.",
  };
};
