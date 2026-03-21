import "server-only";

import { randomBytes, scryptSync } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CurrentUser {
  id: number;
  name: string | null;
  email: string;
  isAdmin: boolean;
}

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const createSession = async (userId: number) => {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ userId, token, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

export const getSessionToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
};

export const deleteSessionByToken = async (token: string) => {
  await db.delete(sessions).where(eq(sessions.token, token));
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result ?? null;
};

export const requireUser = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
};
